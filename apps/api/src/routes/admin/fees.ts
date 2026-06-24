import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../config/prisma.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';
import { createAuditLog } from '../../services/admin.service.js';

const app = new Hono();

app.use(adminAuthMiddleware);

// GET /api/v1/admin/fees
app.get('/', async (c) => {
  const config = await prisma.feeConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return c.json(
    config
      ? {
          id: config.id,
          percentage: config.percentage.toFixed(2),
          minFeeUSDC: config.minFeeUSDC.toFixed(6),
          maxFeeUSDC: config.maxFeeUSDC.toFixed(6),
          createdAt: config.createdAt.toISOString(),
        }
      : null,
  );
});

const SetFeeSchema = z.object({
  percentage: z.string().regex(/^\d+(\.\d{1,2})?$/),
  minFeeUSDC: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  maxFeeUSDC: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
});

// POST /api/v1/admin/fees
app.post('/', zValidator('json', SetFeeSchema), async (c) => {
  const adminId = c.get('adminId');
  const { percentage, minFeeUSDC, maxFeeUSDC } = c.req.valid('json');

  const previous = await prisma.feeConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  await prisma.feeConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const config = await prisma.feeConfig.create({
    data: {
      percentage,
      minFeeUSDC: minFeeUSDC ?? '0',
      maxFeeUSDC: maxFeeUSDC ?? '999999',
      isActive: true,
      setBy: adminId,
    },
  });

  await createAuditLog({
    action: 'FEE_UPDATED',
    performedBy: adminId,
    targetType: 'FeeConfig',
    targetId: config.id,
    previousValue: previous
      ? {
          percentage: previous.percentage.toFixed(2),
          minFeeUSDC: previous.minFeeUSDC.toFixed(6),
          maxFeeUSDC: previous.maxFeeUSDC.toFixed(6),
        }
      : null,
    newValue: { percentage, minFeeUSDC, maxFeeUSDC },
  });

  return c.json(
    {
      id: config.id,
      percentage: config.percentage.toFixed(2),
      minFeeUSDC: config.minFeeUSDC.toFixed(6),
      maxFeeUSDC: config.maxFeeUSDC.toFixed(6),
      createdAt: config.createdAt.toISOString(),
    },
    201,
  );
});

export default app;
