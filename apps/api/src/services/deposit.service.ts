import { formatUnits } from 'viem';
import { prisma } from '../config/prisma.js';
import { creditLedger } from './ledger.service.js';

const USDC_DECIMALS = 6;

export async function processDeposit({
  txHash,
  fromAddress,
  toAddress,
  rawAmount,
  blockNumber,
}: {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  rawAmount: string;
  blockNumber: bigint;
}): Promise<void> {
  // Idempotency — skip if already processed and not in FAILED state
  // FAILED means it was reverted by revertDeposit (chain reorg), so re-process
  const existing = await prisma.deposit.findUnique({ where: { txHash } });
  if (existing && existing.status !== 'FAILED') return;

  const user = await prisma.user.findUnique({
    where: { smartWalletAddress: toAddress.toLowerCase() },
  });
  if (!user) return; // not a BirrBridge wallet

  const amount = formatUnits(BigInt(rawAmount), USDC_DECIMALS);

  // If re-processing after reorg, update the failed record instead of creating new one
  const deposit = existing
    ? await prisma.deposit.update({
        where: { txHash },
        data: {
          userId: user.id,
          token: 'USDC',
          amount,
          fromAddress: fromAddress.toLowerCase(),
          toAddress: toAddress.toLowerCase(),
          blockNumber,
          status: 'PENDING',
          confirmedAt: null,
          creditedAt: null,
        },
      })
    : await prisma.deposit.create({
        data: {
          userId: user.id,
          token: 'USDC',
          amount,
          fromAddress: fromAddress.toLowerCase(),
          toAddress: toAddress.toLowerCase(),
          txHash,
          blockNumber,
          status: 'PENDING',
        },
      });

  // Mark as CONFIRMED then immediately CREDITED
  await prisma.deposit.update({
    where: { id: deposit.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  });

  await creditLedger({
    userId: user.id,
    amount,
    referenceType: 'DEPOSIT',
    referenceId: deposit.id,
    txHash,
    blockNumber,
    description: `Deposit from ${fromAddress.slice(0, 10)}...`,
  });

  await prisma.deposit.update({
    where: { id: deposit.id },
    data: { status: 'CREDITED', creditedAt: new Date() },
  });
}

/** Revert a deposit when a chain reorg removes the activity */
export async function revertDeposit(txHash: string): Promise<void> {
  const deposit = await prisma.deposit.findUnique({ where: { txHash } });
  if (!deposit || deposit.status === 'FAILED') return;

  // If already credited, reverse the ledger entry
  if (deposit.status === 'CREDITED' || deposit.status === 'CONFIRMED') {
    await prisma.ledger.deleteMany({
      where: { referenceType: 'DEPOSIT', referenceId: deposit.id },
    });
  }

  await prisma.deposit.update({
    where: { txHash },
    data: { status: 'FAILED' },
  });
}
