import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../config/prisma.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';

const app = new Hono();

app.use(adminAuthMiddleware);

function buildDateFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);
  return Object.keys(filter).length ? { createdAt: filter } : {};
}

// GET /api/v1/admin/transactions
app.get(
  '/',
  zValidator(
    'query',
    z.object({
      type: z.enum(['deposit', 'transfer', 'swap']).optional(),
      status: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      userId: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
    }),
  ),
  async (c) => {
    const { type, status, dateFrom, dateTo, userId, page, limit } = c.req.valid('query');
    const dateFilter = buildDateFilter(dateFrom, dateTo);

    const queries: Promise<unknown[]>[] = [];

    if (!type || type === 'deposit') {
      const where: Record<string, unknown> = { ...dateFilter };
      if (status) where.status = status;
      if (userId) where.userId = userId;
      queries.push(
        prisma.deposit
          .findMany({ where, orderBy: { createdAt: 'desc' } })
          .then((rows) =>
            rows.map((r) => ({
              id: r.id,
              type: 'deposit' as const,
              userId: r.userId,
              amount: r.amount.toFixed(6),
              token: r.token,
              txHash: r.txHash,
              status: r.status,
              createdAt: r.createdAt.toISOString(),
            })),
          ),
      );
    }

    if (!type || type === 'transfer') {
      const where: Record<string, unknown> = { ...dateFilter };
      if (status) where.status = status;
      if (userId) {
        where.OR = [{ senderId: userId }, { receiverId: userId }];
      }
      queries.push(
        prisma.transfer
          .findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: { select: { id: true, fullName: true } },
              receiver: { select: { id: true, fullName: true } },
            },
          })
          .then((rows) =>
            rows.map((r) => ({
              id: r.id,
              type: 'transfer' as const,
              senderId: r.senderId,
              receiverId: r.receiverId,
              amount: r.amount.toFixed(6),
              token: r.token,
              txHash: r.txHash,
              note: r.note,
              status: r.status,
              sender: r.sender,
              receiver: r.receiver,
              createdAt: r.createdAt.toISOString(),
            })),
          ),
      );
    }

    if (!type || type === 'swap') {
      const where: Record<string, unknown> = { ...dateFilter };
      if (status) where.status = status;
      if (userId) where.userId = userId;
      queries.push(
        prisma.swap
          .findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, fullName: true } },
              bankAccount: { select: { bankName: true, accountNumber: true } },
            },
          })
          .then((rows) =>
            rows.map((r) => ({
              id: r.id,
              type: 'swap' as const,
              userId: r.userId,
              tokenAmount: r.tokenAmount.toFixed(6),
              netETB: r.netETB.toFixed(2),
              appliedRate: r.appliedRate.toFixed(4),
              txHash: r.txHash,
              chapaRef: r.chapaRef,
              status: r.status,
              user: r.user,
              bankAccount: r.bankAccount,
              createdAt: r.createdAt.toISOString(),
            })),
          ),
      );
    }

    const results = await Promise.all(queries);
    const merged = (results.flat() as { createdAt: string }[])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = merged.length;
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    return c.json({ items, total, page, limit });
  },
);

export default app;
