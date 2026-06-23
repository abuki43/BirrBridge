import { z } from 'zod';

export const TokenTypeSchema = z.enum(['USDC']);
export const ChainSchema = z.enum(['BASE']);
export const KycStatusSchema = z.enum(['NONE', 'PENDING', 'VERIFIED', 'REJECTED']);
export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']);
export const LedgerTypeSchema = z.enum(['CREDIT', 'DEBIT']);
export const ReferenceTypeSchema = z.enum(['DEPOSIT', 'TRANSFER_IN', 'TRANSFER_OUT', 'SWAP_OUT', 'FEE']);
export const DepositStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CREDITED', 'FAILED']);
export const TransferStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'FAILED']);
export const SwapStatusSchema = z.enum([
  'PENDING',
  'CRYPTO_PENDING',
  'CRYPTO_CONFIRMED',
  'PAYOUT_PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);
export const AdminRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']);
