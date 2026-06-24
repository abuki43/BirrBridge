import { Prisma, LedgerType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { LedgerEntryInput } from '../types/index.js';

/** Get current USDC balance for a user from the ledger */
export async function getUserBalance(userId: string, tx?: Prisma.TransactionClient): Promise<string> {
  const client = tx ?? prisma;
  const rows = await client.$queryRaw<Array<{ balance: string }>>`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) AS balance
    FROM "Ledger"
    WHERE "userId" = ${userId} AND token = 'USDC'::"TokenType"
  `;

  return new Prisma.Decimal(rows[0]?.balance ?? 0).toDecimalPlaces(6).toString();
}

/** Credit a user's ledger (e.g. deposit received, transfer in) */
export async function creditLedger(input: LedgerEntryInput, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  const currentBalance = await getUserBalance(input.userId, tx);
  const balanceAfter = new Prisma.Decimal(currentBalance).plus(input.amount);

  return client.ledger.create({
    data: {
      userId: input.userId,
      token: 'USDC',
      type: LedgerType.CREDIT,
      amount: new Prisma.Decimal(input.amount),
      balanceAfter,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      txHash: input.txHash,
      blockNumber: input.blockNumber,
      description: input.description,
    },
  });
}

/** Debit a user's ledger (e.g. transfer out, swap) */
export async function debitLedger(input: LedgerEntryInput, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  const currentBalance = await getUserBalance(input.userId, tx);
  const balanceAfter = new Prisma.Decimal(currentBalance).minus(input.amount);

  return client.ledger.create({
    data: {
      userId: input.userId,
      token: 'USDC',
      type: LedgerType.DEBIT,
      amount: new Prisma.Decimal(input.amount),
      balanceAfter,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      txHash: input.txHash,
      blockNumber: input.blockNumber,
      description: input.description,
    },
  });
}
