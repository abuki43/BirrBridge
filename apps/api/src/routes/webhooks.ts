import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../env.js';
import { USDC_ADDRESS } from '../services/privy.service.js';
import { processDeposit } from '../services/deposit.service.js';
import { prisma } from '../config/prisma.js';
import { getSessionStatus } from '../services/arifpay.service.js';
import type { AlchemyActivity } from '../types/index.js';

const app = new Hono();

// POST /api/webhooks/alchemy
app.post('/alchemy', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('x-alchemy-signature') ?? '';

  // Verify HMAC signature
  const expected = createHmac('sha256', env.ALCHEMY_WEBHOOK_AUTH_TOKEN)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody);
  const activities: AlchemyActivity[] = payload?.event?.activity ?? [];

  for (const activity of activities) {
    // Only process ERC-20 USDC transfers (not ETH)
    if (
      activity.category !== 'token' ||
      activity.asset !== 'USDC' ||
      activity.rawContract?.address?.toLowerCase() !== USDC_ADDRESS.toLowerCase()
    ) {
      continue;
    }

    await processDeposit({
      txHash: activity.hash,
      fromAddress: activity.fromAddress,
      toAddress: activity.toAddress,
      rawAmount: activity.rawContract.rawValue,
      blockNumber: BigInt(activity.blockNum),
    }).catch((err) => {
      console.error('processDeposit failed:', err);
    });
  }

  return c.json({ ok: true });
});

// POST /api/webhooks/arifpay
app.post('/arifpay', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('x-arifpay-signature') ?? '';

  const expected = createHmac('sha256', env.ARIFPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody);

  if (payload.sessionId) {
    try {
      const sessionStatus = await getSessionStatus(payload.sessionId);
      const status = sessionStatus.transaction?.transactionStatus;

      await prisma.swap.updateMany({
        where: { arifPayRef: payload.sessionId },
        data: {
          arifPayStatus: status ?? 'UNKNOWN',
          ...(status === 'SUCCESS' || status === 'COMPLETED'
            ? { status: 'COMPLETED', completedAt: new Date() }
            : status === 'FAILED' || status === 'CANCELLED'
              ? { status: 'FAILED' }
              : {}),
        },
      });
    } catch (err) {
      console.error('ArifPay webhook processing failed:', err);
    }
  }

  return c.json({ ok: true });
});

export default app;
