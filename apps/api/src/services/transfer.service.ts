import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { sponsoredTransfer, getUserWalletId } from './privy.service.js';
import { creditLedger, debitLedger, getUserBalance } from './ledger.service.js';
import { TransferError } from '../errors/index.js';

const MIN_TRANSFER_USDC = 1;

interface TransferInput {
  senderDbUserId: string;
  senderPrivyUserId: string;
  to: string;
  amount: string;
  note?: string;
}

export async function sendTransfer(input: TransferInput) {
  const { senderDbUserId, senderPrivyUserId, to, amount, note } = input;

  const amountNum = parseFloat(amount);
  if (amountNum < MIN_TRANSFER_USDC) {
    throw new TransferError(`Minimum transfer is ${MIN_TRANSFER_USDC} USDC`);
  }

  const recipient = await prisma.user.findFirst({
    where: {
      AND: [
        { id: { not: senderDbUserId } },
        { status: 'ACTIVE' },
        {
          OR: [
            { id: to },
            { email: to },
            { phone: to },
          ],
        },
      ],
    },
  });
  if (!recipient) {
    throw new TransferError('Recipient not found');
  }
  if (!recipient.smartWalletAddress) {
    throw new TransferError('Recipient has no wallet');
  }

  const balance = await getUserBalance(senderDbUserId);
  if (new Prisma.Decimal(balance).lessThan(amount)) {
    throw new TransferError('Insufficient balance');
  }

  const walletId = await getUserWalletId(senderPrivyUserId);
  if (!walletId) {
    throw new TransferError('Sender wallet not found');
  }

  const txHash = await sponsoredTransfer({
    senderWalletId: walletId,
    recipientAddress: recipient.smartWalletAddress,
    amount,
  });

  const transfer = await prisma.transfer.create({
    data: {
      senderId: senderDbUserId,
      receiverId: recipient.id,
      token: 'USDC',
      amount: new Prisma.Decimal(amount),
      txHash,
      note: note ?? null,
      status: 'PENDING',
    },
  });

  await debitLedger({
    userId: senderDbUserId,
    amount,
    referenceType: 'TRANSFER_OUT',
    referenceId: transfer.id,
    txHash,
    description: `Transfer to ${recipient.fullName ?? recipient.email ?? 'user'}`,
  });

  await creditLedger({
    userId: recipient.id,
    amount,
    referenceType: 'TRANSFER_IN',
    referenceId: transfer.id,
    txHash,
    description: `Transfer from sender`,
  });

  await prisma.transfer.update({
    where: { id: transfer.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  });

  return {
    id: transfer.id,
    amount,
    token: 'USDC' as const,
    note: note ?? null,
    txHash,
    status: 'CONFIRMED' as const,
    receiver: {
      id: recipient.id,
      fullName: recipient.fullName,
    },
  };
}

export async function getTransferHistory(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.transfer.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    }),
    prisma.transfer.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    }),
  ]);

  const mapped = items.map((t) => ({
    id: t.id,
    amount: t.amount.toFixed(6),
    token: t.token as 'USDC',
    note: t.note,
    txHash: t.txHash,
    status: t.status,
    direction: t.senderId === userId ? 'SENT' as const : 'RECEIVED' as const,
    otherParty: t.senderId === userId
      ? { id: t.receiver.id, fullName: t.receiver.fullName }
      : { id: t.sender.id, fullName: t.sender.fullName },
    createdAt: t.createdAt.toISOString(),
  }));

  return { items: mapped, total, page, limit };
}
