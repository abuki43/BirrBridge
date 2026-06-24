import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../config/prisma.js';
import { redis } from '../../config/redis.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';
import { createAuditLog } from '../../services/admin.service.js';

const app = new Hono();

app.use(adminAuthMiddleware);

// GET /api/v1/admin/rates
app.get('/', async (c) => {
  const [current, history] = await Promise.all([
    prisma.rateConfig.findFirst({
      where: { token: 'USDC', isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rateConfig.findMany({
      where: { token: 'USDC' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return c.json({
    current: current
      ? { id: current.id, sellRate: current.sellRate.toFixed(4), createdAt: current.createdAt.toISOString() }
      : null,
    history: history.map((r) => ({
      id: r.id,
      sellRate: r.sellRate.toFixed(4),
      isActive: r.isActive,
      setBy: r.setBy,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

const SetRateSchema = z.object({
  sellRate: z.string().regex(/^\d+(\.\d{1,4})?$/),
});

// POST /api/v1/admin/rates
app.post('/', zValidator('json', SetRateSchema), async (c) => {
  const adminId = c.get('adminId');
  const { sellRate } = c.req.valid('json');

  const previous = await prisma.rateConfig.findFirst({
    where: { token: 'USDC', isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  await prisma.rateConfig.updateMany({
    where: { token: 'USDC', isActive: true },
    data: { isActive: false },
  });

  const rate = await prisma.rateConfig.create({
    data: {
      token: 'USDC',
      sellRate: sellRate,
      isActive: true,
      setBy: adminId,
    },
  });

  await redis.set('rate:USDC', sellRate, 60);

  await createAuditLog({
    action: 'RATE_UPDATED',
    performedBy: adminId,
    targetType: 'RateConfig',
    targetId: rate.id,
    previousValue: previous ? { sellRate: previous.sellRate.toFixed(4) } : null,
    newValue: { sellRate },
  });

  return c.json(
    {
      id: rate.id,
      sellRate: rate.sellRate.toFixed(4),
      createdAt: rate.createdAt.toISOString(),
    },
    201,
  );
});

export default app;
