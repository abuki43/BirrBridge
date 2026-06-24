import type { ReferenceType } from '@prisma/client';

export interface LedgerEntryInput {
  userId: string;
  amount: string;
  referenceType: ReferenceType;
  referenceId: string;
  txHash?: string;
  blockNumber?: bigint;
  description?: string;
}
