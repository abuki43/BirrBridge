import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { getUserBalance } from '../services/ledger.service.js';
import { env } from '../env.js';

const app = new Hono();

app.use(authMiddleware);

// GET /api/user/me
app.get('/me', async (c) => {
  const user = await prisma.user.findUnique({
    where: { id: c.get('dbUserId') },
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      smartWalletAddress: true,
      kycStatus: true,
      status: true,
      createdAt: true,
    },
  });
  return c.json(user);
});

// PUT /api/user/me
app.put(
  '/me',
  zValidator('json', z.object({ fullName: z.string().min(1).max(100) })),
  async (c) => {
    const { fullName } = c.req.valid('json');
    const user = await prisma.user.update({
      where: { id: c.get('dbUserId') },
      data: { fullName },
      select: { id: true, fullName: true },
    });
    return c.json(user);
  }
);

// GET /api/user/balance
app.get('/balance', async (c) => {
  const userId = c.get('dbUserId');
  const usdc = await getUserBalance(userId);

  // ETB value using current rate from DB
  const rateConfig = await prisma.rateConfig.findFirst({
    where: { token: 'USDC', isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  const rate = rateConfig?.sellRate.toNumber() ?? 0;
  const usdcNum = parseFloat(usdc);
  const totalETB = (usdcNum * rate).toFixed(2);

  return c.json({
    usdc,
    totalUSD: usdcNum.toFixed(2),
    totalETB,
    rate: rate.toFixed(4),
  });
});

// GET /api/users/search?q=
app.get(
  '/search',
  zValidator('query', z.object({ q: z.string().min(3) })),
  async (c) => {
    const { q } = c.req.valid('query');
    const dbUserId = c.get('dbUserId');

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: dbUserId } },
          { status: 'ACTIVE' },
          {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } },
            ],
          },
        ],
      },
      select: { id: true, fullName: true, smartWalletAddress: true },
      take: 10,
    });

    return c.json(users);
  }
);

// POST /api/user/push-token
app.post(
  '/push-token',
  zValidator('json', z.object({ token: z.string().min(1) })),
  async (c) => {
    const { token } = c.req.valid('json');
    await prisma.user.update({
      where: { id: c.get('dbUserId') },
      data: { pushToken: token },
    });
    return c.json({ ok: true });
  }
);

export default app;
