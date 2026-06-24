import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { env } from '../env.js';
import { getUserWalletId, sponsoredTransfer } from './privy.service.js';
import { debitLedger, getUserBalance } from './ledger.service.js';
import { initiateTransfer, fetchBanks } from './chapa.service.js';
import { getChapaBankCode } from '../utils/index.js';
import { SwapError } from '../errors/index.js';
import type { SwapQuoteData, SwapDbRow, SwapDbRowItem } from '../types/index.js';
import { calculateSwapQuote } from '@repo/shared';
import crypto from 'crypto';

const QUOTE_TTL_SECONDS = 60;
const MIN_SWAP = 10;
const MAX_SWAP = 10_000;
const FEE_PERCENTAGE = '1.00';

export async function getRate(): Promise<{ rate: string }> {
  const cached = await redis.get('rate:USDC');
  if (cached) return { rate: cached };

  const config = await prisma.rateConfig.findFirst({
    where: { token: 'USDC', isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  const rate = config?.sellRate.toNumber() ?? 0;

  if (rate > 0) {
    await redis.set('rate:USDC', rate.toString(), 60);
  }

  return { rate: rate.toFixed(4) };
}

export async function createQuote(userId: string, amount: string) {
  const amountNum = parseFloat(amount);
  if (amountNum < MIN_SWAP) throw new SwapError(`Minimum swap is ${MIN_SWAP} USDC`);
  if (amountNum > MAX_SWAP) throw new SwapError(`Maximum swap is ${MAX_SWAP} USDC`);

  const { rate } = await getRate();
  if (parseFloat(rate) <= 0) throw new SwapError('Rate not available');

  const quote = calculateSwapQuote({ tokenAmount: amount, rate, feePercentage: FEE_PERCENTAGE });

  const quoteId = crypto.randomUUID();
  const quoteData: SwapQuoteData = { ...quote, userId, createdAt: Date.now() };
  await redis.set(`quote:${quoteId}`, JSON.stringify(quoteData), QUOTE_TTL_SECONDS);

  return {
    quoteId,
    ...quote,
    expiresAt: new Date(Date.now() + QUOTE_TTL_SECONDS * 1000).toISOString(),
  };
}

export async function executeSwap(
  userId: string,
  privyUserId: string,
  quoteId: string,
  bankAccountId: string,
) {
  const raw = await redis.get(`quote:${quoteId}`);
  if (!raw) throw new SwapError('Quote expired or not found');

  const quote = JSON.parse(raw) as SwapQuoteData;
  await redis.del(`quote:${quoteId}`);

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id: bankAccountId, userId },
  });
  if (!bankAccount) throw new SwapError('Bank account not found');

  const balance = await getUserBalance(userId);
  if (new Prisma.Decimal(balance).lessThan(quote.tokenAmount)) {
    throw new SwapError('Insufficient balance');
  }

  const walletId = await getUserWalletId(privyUserId);
  if (!walletId) throw new SwapError('Wallet not found');

  const txHash = await sponsoredTransfer({
    senderWalletId: walletId,
    recipientAddress: env.PLATFORM_TREASURY_ADDRESS,
    amount: quote.tokenAmount,
  });

  const swap = await prisma.swap.create({
    data: {
      userId,
      bankAccountId,
      token: 'USDC',
      tokenAmount: new Prisma.Decimal(quote.tokenAmount),
      feeTokenAmount: new Prisma.Decimal(quote.feeTokenAmount),
      netTokenAmount: new Prisma.Decimal(quote.netTokenAmount),
      appliedRate: new Prisma.Decimal(quote.appliedRate),
      grossETB: new Prisma.Decimal(quote.grossETB),
      feeETB: new Prisma.Decimal(quote.feeETB),
      netETB: new Prisma.Decimal(quote.netETB),
      feePercentage: new Prisma.Decimal(quote.feePercentage),
      txHash,
      status: 'CRYPTO_CONFIRMED',
    },
  });

  await debitLedger({
    userId,
    amount: quote.tokenAmount,
    referenceType: 'SWAP_OUT',
    referenceId: swap.id,
    txHash,
    description: `Swap ${quote.tokenAmount} USDC → ETB`,
  });

  try {
    const bankCode = await getChapaBankCode(bankAccount.bankName, fetchBanks);

    const transfer = await initiateTransfer({
      account_name: bankAccount.accountName,
      account_number: bankAccount.accountNumber,
      amount: quote.netETB,
      bank_code: bankCode,
      reference: swap.id,
    });

    const chapaRef = transfer.data?.reference ?? '';
    await prisma.swap.update({
      where: { id: swap.id },
      data: { chapaRef, chapaStatus: 'TRANSFER_INITIATED', status: 'PAYOUT_PENDING' },
    });
  } catch {
    await prisma.swap.update({
      where: { id: swap.id },
      data: { chapaStatus: 'PAYOUT_FAILED', status: 'FAILED' },
    });
  }

  const updated = await prisma.swap.findUnique({ where: { id: swap.id } });
  return formatSwapResponse(updated!);
}

export async function getSwapHistory(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.swap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.swap.count({ where: { userId } }),
  ]);

  return {
    items: items.map((s) => formatSwapItem(s)),
    total,
    page,
    limit,
  };
}

export async function getSwapDetail(id: string, userId: string) {
  const swap = await prisma.swap.findFirst({ where: { id, userId } });
  if (!swap) throw new SwapError('Swap not found');
  return formatSwapResponse(swap);
}

function formatSwapResponse(s: SwapDbRow) {
  return {
    id: s.id,
    tokenAmount: s.tokenAmount.toFixed(6),
    feeTokenAmount: s.feeTokenAmount.toFixed(6),
    netTokenAmount: s.netTokenAmount.toFixed(6),
    appliedRate: s.appliedRate.toFixed(4),
    grossETB: s.grossETB.toFixed(2),
    feeETB: s.feeETB.toFixed(2),
    netETB: s.netETB.toFixed(2),
    txHash: s.txHash,
    chapaRef: s.chapaRef,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
}

function formatSwapItem(s: SwapDbRowItem) {
  return {
    id: s.id,
    tokenAmount: s.tokenAmount.toFixed(6),
    netETB: s.netETB.toFixed(2),
    appliedRate: s.appliedRate.toFixed(4),
    txHash: s.txHash,
    chapaRef: s.chapaRef,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
}
