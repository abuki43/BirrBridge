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
  rawAmount: string; // raw token units as string
  blockNumber: bigint;
}): Promise<void> {
  // Idempotency — skip if already processed
  const existing = await prisma.deposit.findUnique({ where: { txHash } });
  if (existing) return;

  const user = await prisma.user.findUnique({
    where: { smartWalletAddress: toAddress.toLowerCase() },
  });
  if (!user) return; // not a BirrBridge wallet

  const amount = formatUnits(BigInt(rawAmount), USDC_DECIMALS);

  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      token: 'USDC',
      amount,
      fromAddress: fromAddress.toLowerCase(),
      toAddress: toAddress.toLowerCase(),
      txHash,
      blockNumber,
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
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
