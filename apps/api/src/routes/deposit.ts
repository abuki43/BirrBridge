import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono();

app.use(authMiddleware);

// GET /api/deposit/history
app.get(
  '/history',
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const userId = c.get('dbUserId');

    const [items, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          token: true,
          amount: true,
          fromAddress: true,
          txHash: true,
          status: true,
          confirmedAt: true,
          createdAt: true,
        },
      }),
      prisma.deposit.count({ where: { userId } }),
    ]);

    return c.json({ items, total, page, limit });
  }
);

// GET /api/deposit/:id
app.get('/:id', async (c) => {
  const userId = c.get('dbUserId');
  const deposit = await prisma.deposit.findFirst({
    where: { id: c.req.param('id'), userId },
  });
  if (!deposit) return c.json({ error: 'Not found' }, 404);
  return c.json(deposit);
});

export default app;
