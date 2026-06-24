import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../env.js';
import { USDC_ADDRESS } from '../services/privy.service.js';
import { processDeposit, revertDeposit } from '../services/deposit.service.js';
import { prisma } from '../config/prisma.js';
import type { AlchemyActivity, ChapaPayoutWebhookPayload } from '../types/index.js';

const app = new Hono();

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// POST /api/webhooks/alchemy
app.post('/alchemy', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('x-alchemy-signature') ?? '';

  // Use per-webhook Signing Key (NOT ALCHEMY_WEBHOOK_AUTH_TOKEN which is for REST API)
  const expected = createHmac('sha256', env.ALCHEMY_WEBHOOK_SIGNING_KEY)
    .update(rawBody)
    .digest('hex');

  if (!safeCompare(signature, expected)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody);
  const activities: AlchemyActivity[] = payload?.event?.activity ?? [];

  for (const activity of activities) {
    // Handle chain reorg — activity removed from the canonical chain
    const isRemoved = activity.removed ?? activity.log?.removed ?? false;
    if (isRemoved) {
      await revertDeposit(activity.hash).catch((err) => {
        console.error('revertDeposit failed:', err);
      });
      continue;
    }

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

  // Chapa may send signature as either header
  const signature = c.req.header('x-chapa-signature')
    ?? c.req.header('chapa-signature')
    ?? '';

  if (!signature) {
    return c.json({ error: 'Missing signature header' }, 401);
  }

  const expected = createHmac('sha256', env.CHAPA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (!safeCompare(signature, expected)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody) as ChapaPayoutWebhookPayload;

  if (payload.reference && payload.event?.startsWith('payout.')) {
    try {
      // Chapa may send status as 'data.status' in nested payload
      const status = payload.data?.status ?? payload.status;

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
