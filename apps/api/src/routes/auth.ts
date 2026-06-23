import { Hono } from 'hono';
import { prisma } from '../config/prisma.js';
import { env } from '../env.js';
import { privy, extractSmartWalletAddress } from '../services/privy.service.js';
import { registerAddressWebhook } from '../services/alchemy.service.js';

const app = new Hono();

app.post('/', async (c) => {
  const rawBody = await c.req.text();
  const svixId = c.req.header('svix-id') ?? '';
  const svixTimestamp = c.req.header('svix-timestamp') ?? '';
  const svixSignature = c.req.header('svix-signature') ?? '';

  // Verify Privy webhook signature
  try {
    await privy.verifyWebhook(
      rawBody,
      { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      env.PRIVY_WEBHOOK_SECRET
    );
  } catch {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(rawBody);

  // Only handle user creation events
  if (payload.type !== 'user.created') {
    return c.json({ ok: true });
  }

  const { id, email, phone, linked_accounts } = payload.data;

  const smartWalletAddress = extractSmartWalletAddress(linked_accounts ?? []);

  const user = await prisma.user.upsert({
    where: { privyId: id },
    create: {
      privyId: id,
      email: email?.address ?? null,
      phone: phone?.number ?? null,
      smartWalletAddress,
    },
    update: {
      ...(smartWalletAddress && { smartWalletAddress }),
    },
  });

  // Register address with Alchemy webhook for deposit detection
  if (smartWalletAddress) {
    try {
      await registerAddressWebhook(smartWalletAddress);
    } catch (err) {
      // Non-fatal: log and continue — fallback polling will catch deposits
      console.error('Alchemy webhook registration failed:', err);
    }
  }

  return c.json({ ok: true, userId: user.id });
});

export default app;
