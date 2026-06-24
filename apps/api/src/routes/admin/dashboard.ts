import { Hono } from 'hono';
import { prisma } from '../../config/prisma.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.js';
import type { DashboardStats } from '../../types/index.js';

const app = new Hono();

app.use(adminAuthMiddleware);

// GET /api/v1/admin/dashboard/stats
app.get('/stats', async (c) => {
  const [
    totalUsers,
    totalDeposits,
    depositAgg,
    totalTransfers,
    totalSwaps,
    swapAgg,
    feeAgg,
    todayUsers,
    todayDeposits,
    todaySwaps,
    todayTransfers,
    todaySwapAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.deposit.count(),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.transfer.count(),
    prisma.swap.count(),
    prisma.swap.aggregate({ _sum: { tokenAmount: true } }),
    prisma.swap.aggregate({ _sum: { feeTokenAmount: true }, where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.deposit.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.swap.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.transfer.count({ where: { createdAt: { gte: startOfDay() } } }),
    prisma.swap.aggregate({
      _sum: { tokenAmount: true },
      where: { createdAt: { gte: startOfDay() } },
    }),
  ]);

  const stats: DashboardStats = {
    totalUsers,
    totalDeposits,
    totalDepositVolume: (depositAgg._sum.amount ?? 0).toFixed(2),
    totalTransfers,
    totalSwaps,
    totalSwapVolume: (swapAgg._sum.tokenAmount ?? 0).toFixed(2),
    feesCollected: (feeAgg._sum.feeTokenAmount ?? 0).toFixed(6),
    todayStats: {
      newUsers: todayUsers,
      deposits: todayDeposits,
      swaps: todaySwaps,
      transfers: todayTransfers,
      swapVolume: (todaySwapAgg._sum.tokenAmount ?? 0).toFixed(2),
    },
  };

  return c.json(stats);
});

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default app;
