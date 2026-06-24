import { Prisma, ReferenceType, LedgerType } from '@prisma/client';
import { prisma } from '../config/prisma.js';

/** Get current USDC balance for a user from the ledger */
export async function getUserBalance(userId: string): Promise<string> {
  const rows = await prisma.$queryRaw<Array<{ balance: string }>>`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) AS balance
    FROM "Ledger"
    WHERE "userId" = ${userId} AND token = 'USDC'::"TokenType"
  `;

  return new Prisma.Decimal(rows[0]?.balance ?? 0).toDecimalPlaces(6).toString();
}

/** Credit a user's ledger (e.g. deposit received, transfer in) */
export async function creditLedger({
  userId,
  amount,
  referenceType,
  referenceId,
  txHash,
  blockNumber,
  description,
}: {
  userId: string;
  amount: string;
  referenceType: ReferenceType;
  referenceId: string;
  txHash?: string;
  blockNumber?: bigint;
  description?: string;
}) {
  const currentBalance = await getUserBalance(userId);
  const balanceAfter = new Prisma.Decimal(currentBalance).plus(amount);

  return prisma.ledger.create({
    data: {
      userId,
      token: 'USDC',
      type: LedgerType.CREDIT,
      amount: new Prisma.Decimal(amount),
      balanceAfter,
      referenceType,
      referenceId,
      txHash,
      blockNumber,
      description,
    },
  });
}

/** Debit a user's ledger (e.g. transfer out, swap) */
export async function debitLedger({
  userId,
  amount,
  referenceType,
  referenceId,
  txHash,
  blockNumber,
  description,
}: {
  userId: string;
  amount: string;
  referenceType: ReferenceType;
  referenceId: string;
  txHash?: string;
  blockNumber?: bigint;
  description?: string;
}) {
  const currentBalance = await getUserBalance(userId);
  const balanceAfter = new Prisma.Decimal(currentBalance).minus(amount);

  return prisma.ledger.create({
    data: {
      userId,
      token: 'USDC',
      type: LedgerType.DEBIT,
      amount: new Prisma.Decimal(amount),
      balanceAfter,
      referenceType,
      referenceId,
      txHash,
      blockNumber,
      description,
    },
  });
}
