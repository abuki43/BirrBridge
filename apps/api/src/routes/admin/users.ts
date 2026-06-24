import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../config/prisma.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';
import { createAuditLog } from '../../services/admin.service.js';

const app = new Hono();

app.use(adminAuthMiddleware);

// GET /api/v1/admin/users
app.get(
  '/',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
      search: z.string().optional(),
      status: z.string().optional(),
    }),
  ),
  async (c) => {
    const { page, limit, search, status } = c.req.valid('query');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.user.count({ where }),
    ]);

    return c.json({ items, total, page, limit });
  },
);

// GET /api/v1/admin/users/:id
app.get('/:id', async (c) => {
  const user = await prisma.user.findUnique({
    where: { id: c.req.param('id') },
    include: {
      bankAccounts: true,
      _count: {
        select: {
          deposits: true,
          swaps: true,
          transfersSent: true,
          transfersReceived: true,
        },
      },
    },
  });

  if (!user) return c.json({ error: 'User not found' }, 404);

  const swapAgg = await prisma.swap.aggregate({
    _sum: { tokenAmount: true },
    where: { userId: user.id, status: 'COMPLETED' },
  });

  return c.json({
    ...user,
    totalSwapVolume: (swapAgg._sum.tokenAmount ?? 0).toFixed(2),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
});

// PATCH /api/v1/admin/users/:id/status
app.patch(
  '/:id/status',
  zValidator(
    'json',
    z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
    }),
  ),
  async (c) => {
    const adminId = c.get('adminId');
    const userId = c.req.param('id');
    const { status } = c.req.valid('json');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ error: 'User not found' }, 404);

    const previousStatus = user.status;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await createAuditLog({
      action: 'USER_STATUS_UPDATED',
      performedBy: adminId,
      targetType: 'User',
      targetId: userId,
      previousValue: { status: previousStatus },
      newValue: { status },
    });

    return c.json(updated);
  },
);

export default app;
