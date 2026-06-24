import { Hono } from 'hono';
import { createHmac } from 'crypto';
import { env } from '../env.js';
import { USDC_ADDRESS } from '../services/privy.service.js';
import { processDeposit } from '../services/deposit.service.js';
import { prisma } from '../config/prisma.js';
import { verifyTransfer } from '../services/chapa.service.js';
import type { AlchemyActivity, ChapaPayoutWebhookPayload } from '../types/index.js';

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

// POST /api/webhooks/chapa
app.post('/chapa', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('x-chapa-signature') ?? '';

  const expected = createHmac('sha256', env.CHAPA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody) as ChapaPayoutWebhookPayload;

  if (payload.reference && payload.event?.startsWith('payout.')) {
    try {
      const status = payload.status;

      await prisma.swap.updateMany({
        where: { chapaRef: payload.reference },
        data: {
          chapaStatus: status ?? 'UNKNOWN',
          ...(status === 'success'
            ? { status: 'COMPLETED', completedAt: new Date() }
            : status === 'failed' || status === 'cancelled'
              ? { status: 'FAILED' }
              : {}),
        },
      });
    } catch (err) {
      console.error('Chapa webhook processing failed:', err);
    }
  }

  return c.json({ ok: true });
});

export default app;
