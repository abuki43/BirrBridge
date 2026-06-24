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

  const errors: string[] = [];

  for (const activity of activities) {
    // Handle chain reorg — activity removed from the canonical chain
    const isRemoved = activity.removed ?? activity.log?.removed ?? false;
    if (isRemoved) {
      try {
        await revertDeposit(activity.hash);
      } catch (err) {
        errors.push(`revertDeposit(${activity.hash}): ${err}`);
      }
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

    try {
      await processDeposit({
        txHash: activity.hash,
        fromAddress: activity.fromAddress,
        toAddress: activity.toAddress,
        rawAmount: activity.rawContract.rawValue,
        blockNumber: BigInt(activity.blockNum),
      });
    } catch (err) {
      errors.push(`processDeposit(${activity.hash}): ${err}`);
    }
  }

  if (errors.length > 0) {
    console.error('Alchemy webhook errors:', errors);
    return c.json({ ok: false, errors }, 500);
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
    const swap = await prisma.swap.findFirst({
      where: { chapaRef: payload.reference },
    });

    if (!swap) {
      console.error(`Chapa webhook: no swap found for ref ${payload.reference}`);
      return c.json({ error: 'Swap not found' }, 404);
    }

    const status = payload.data?.status ?? payload.status;

    await prisma.swap.update({
      where: { id: swap.id },
      data: {
        chapaStatus: status ?? 'UNKNOWN',
        ...(status === 'success'
          ? { status: 'COMPLETED', completedAt: new Date() }
          : status === 'failed' || status === 'cancelled'
            ? { status: 'FAILED' }
            : {}),
      },
    });
  }

  return c.json({ ok: true });
});

export default app;
