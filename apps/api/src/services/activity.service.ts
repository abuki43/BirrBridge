import { prisma } from '../config/prisma.js';
import type { ActivityItem, DepositActivity, TransferActivity, SwapActivity } from '@repo/shared';

interface ActivityFilters {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

function buildDateFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);
  return Object.keys(filter).length ? { createdAt: filter } : {};
}

async function fetchDeposits(
  userId: string,
  status: string | undefined,
  dateFilter: Record<string, unknown>,
): Promise<DepositActivity[]> {
  const where: Record<string, unknown> = { userId, ...dateFilter };
  if (status) where.status = status;

  const rows = await prisma.deposit.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      fromAddress: true,
      txHash: true,
      status: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: 'deposit' as const,
    amount: r.amount.toFixed(6),
    token: 'USDC' as const,
    status: r.status,
    fromAddress: r.fromAddress,
    txHash: r.txHash,
    createdAt: r.createdAt.toISOString(),
  }));
}

async function fetchTransfers(
  userId: string,
  status: string | undefined,
  dateFilter: Record<string, unknown>,
): Promise<TransferActivity[]> {
  const where: Record<string, unknown> = {
    OR: [{ senderId: userId }, { receiverId: userId }],
    ...dateFilter,
  };
  if (status) where.status = status;

  const rows = await prisma.transfer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      txHash: true,
      note: true,
      status: true,
      senderId: true,
      receiverId: true,
      sender: { select: { id: true, fullName: true } },
      receiver: { select: { id: true, fullName: true } },
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: 'transfer' as const,
    amount: r.amount.toFixed(6),
    token: 'USDC' as const,
    status: r.status,
    direction: r.senderId === userId ? 'SENT' as const : 'RECEIVED' as const,
    otherParty: r.senderId === userId
      ? { id: r.receiver.id, fullName: r.receiver.fullName }
      : { id: r.sender.id, fullName: r.sender.fullName },
    note: r.note,
    txHash: r.txHash ?? '',
    createdAt: r.createdAt.toISOString(),
  }));
}

async function fetchSwaps(
  userId: string,
  status: string | undefined,
  dateFilter: Record<string, unknown>,
): Promise<SwapActivity[]> {
  const where: Record<string, unknown> = { userId, ...dateFilter };
  if (status) where.status = status;

  const rows = await prisma.swap.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      tokenAmount: true,
      netETB: true,
      appliedRate: true,
      txHash: true,
      chapaRef: true,
      status: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: 'swap' as const,
    amount: r.tokenAmount.toFixed(6),
    token: 'USDC' as const,
    status: r.status,
    netETB: r.netETB.toFixed(2),
    appliedRate: r.appliedRate.toFixed(4),
    txHash: r.txHash,
    chapaRef: r.chapaRef,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getActivityFeed(userId: string, filters: ActivityFilters) {
  const { type, status, dateFrom, dateTo, page, limit } = filters;
  const dateFilter = buildDateFilter(dateFrom, dateTo);

  const queries: Promise<ActivityItem[]>[] = [];

  if (!type || type === 'deposit') {
    queries.push(fetchDeposits(userId, status, dateFilter));
  }
  if (!type || type === 'transfer') {
    queries.push(fetchTransfers(userId, status, dateFilter));
  }
  if (!type || type === 'swap') {
    queries.push(fetchSwaps(userId, status, dateFilter));
  }

  const results = await Promise.all(queries);
  const merged = results
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = merged.length;
  const start = (page - 1) * limit;
  const items = merged.slice(start, start + limit);

  return { items, total, page, limit };
}
