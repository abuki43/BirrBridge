import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../config/prisma.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';

const app = new Hono();

app.use(adminAuthMiddleware);

// GET /api/v1/admin/audit-log
app.get(
  '/',
  zValidator(
    'query',
    z.object({
      action: z.string().optional(),
      adminId: z.string().optional(),
      targetType: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
    }),
  ),
  async (c) => {
    const { action, adminId, targetType, dateFrom, dateTo, page, limit } = c.req.valid('query');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (adminId) where.performedBy = adminId;
    if (targetType) where.targetType = targetType;
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return c.json({
      items: items.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  },
);

export default app;
