import type { Prisma } from '@prisma/client';

export interface SwapQuoteData {
  tokenAmount: string;
  feeTokenAmount: string;
  netTokenAmount: string;
  appliedRate: string;
  grossETB: string;
  feeETB: string;
  netETB: string;
  feePercentage: string;
  userId: string;
  createdAt: number;
}

export interface SwapDbRow {
  id: string;
  tokenAmount: Prisma.Decimal;
  feeTokenAmount: Prisma.Decimal;
  netTokenAmount: Prisma.Decimal;
  appliedRate: Prisma.Decimal;
  grossETB: Prisma.Decimal;
  feeETB: Prisma.Decimal;
  netETB: Prisma.Decimal;
  txHash: string | null;
  arifPayRef: string | null;
  status: string;
  createdAt: Date;
}

export interface SwapDbRowItem {
  id: string;
  tokenAmount: Prisma.Decimal;
  netETB: Prisma.Decimal;
  appliedRate: Prisma.Decimal;
  txHash: string | null;
  arifPayRef: string | null;
  status: string;
  createdAt: Date;
}
