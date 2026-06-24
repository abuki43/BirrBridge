import { prisma } from '../config/prisma.js';
import { alchemyRpcUrl } from './privy.service.js';
import { creditLedger, debitLedger } from './ledger.service.js';

const STALE_AFTER_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 30 * 1000;

async function checkUserOpReceipt(userOpHash: string): Promise<{
  txHash: string | null;
  success: boolean;
}> {
  try {
    const res = await fetch(alchemyRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getUserOperationReceipt',
        params: [userOpHash],
      }),
    });

    const body = await res.json() as {
      result?: {
        receipt: { transactionHash: string; success: boolean };
        success: boolean;
      } | null;
    };

    const receipt = body?.result;
    if (!receipt) return { txHash: null, success: false };

    return {
      txHash: receipt.receipt?.transactionHash ?? null,
      success: receipt.receipt?.success ?? receipt.success ?? false,
    };
  } catch {
    return { txHash: null, success: false };
  }
}

async function reconcileTransfers(): Promise<void> {
  const staleSince = new Date(Date.now() - STALE_AFTER_MS);

  const stuck = await prisma.transfer.findMany({
    where: {
      status: 'PENDING',
      userOpHash: { not: null },
      txHash: null,
      createdAt: { lt: staleSince },
    },
  });

  for (const transfer of stuck) {
    const { txHash, success } = await checkUserOpReceipt(transfer.userOpHash!);

    if (txHash && success) {
      await prisma.$transaction(async (tx) => {
        const sender = await tx.user.findUnique({ where: { id: transfer.senderId } });
        const receiver = await tx.user.findUnique({ where: { id: transfer.receiverId } });

        await debitLedger({
          userId: transfer.senderId,
          amount: transfer.amount.toFixed(6),
          referenceType: 'TRANSFER_OUT',
          referenceId: transfer.id,
          txHash,
          description: `Transfer to ${receiver?.fullName ?? receiver?.email ?? 'user'}`,
        }, tx);

        await creditLedger({
          userId: transfer.receiverId,
          amount: transfer.amount.toFixed(6),
          referenceType: 'TRANSFER_IN',
          referenceId: transfer.id,
          txHash,
          description: `Transfer from ${sender?.fullName ?? sender?.email ?? 'user'}`,
        }, tx);

        await tx.transfer.update({
          where: { id: transfer.id },
          data: { txHash, status: 'CONFIRMED', confirmedAt: new Date() },
        });
      });
    } else if (txHash && !success) {
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { txHash, status: 'FAILED', failureReason: 'UserOperation reverted on-chain' },
      });
    }
  }
}

async function reconcileSwaps(): Promise<void> {
  const staleSince = new Date(Date.now() - STALE_AFTER_MS);

  const stuck = await prisma.swap.findMany({
    where: {
      status: 'CRYPTO_PENDING',
      userOpHash: { not: null },
      txHash: null,
      createdAt: { lt: staleSince },
    },
    include: { bankAccount: true },
  });

  for (const swap of stuck) {
    const { txHash, success } = await checkUserOpReceipt(swap.userOpHash!);

    if (txHash && success) {
      await prisma.swap.update({
        where: { id: swap.id },
        data: { txHash, status: 'CRYPTO_CONFIRMED' },
      });

      await debitLedger({
        userId: swap.userId,
        amount: swap.tokenAmount.toFixed(6),
        referenceType: 'SWAP_OUT',
        referenceId: swap.id,
        txHash,
        description: `Swap ${swap.tokenAmount.toFixed(6)} USDC → ETB`,
      });
    } else if (txHash && !success) {
      await prisma.swap.update({
        where: { id: swap.id },
        data: { txHash, status: 'FAILED', failureReason: 'UserOperation reverted on-chain' },
      });
    }
  }
}

export async function reconcile(): Promise<void> {
  await Promise.all([reconcileTransfers(), reconcileSwaps()]);
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startReconciliation(): void {
  if (intervalHandle) return;
  reconcile().catch(() => {});
  intervalHandle = setInterval(() => {
    reconcile().catch((err) => console.error('Reconciliation failed:', err));
  }, POLL_INTERVAL_MS);
}

export function stopReconciliation(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
