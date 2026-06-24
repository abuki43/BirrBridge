export type TokenType = 'USDC';
export type Chain = 'BASE';
export type KycStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type DepositStatus = 'PENDING' | 'CONFIRMED' | 'CREDITED' | 'FAILED';
export type TransferStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type SwapStatus =
  | 'PENDING'
  | 'CRYPTO_PENDING'
  | 'CRYPTO_CONFIRMED'
  | 'PAYOUT_PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  smartWalletAddress: string | null;
  kycStatus: KycStatus;
  status: UserStatus;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface BalanceResponse {
  usdc: string;
  totalUSD: string;
  totalETB: string;
  rate: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TransferRecipient {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
}

export interface TransferResponse {
  id: string;
  amount: string;
  token: TokenType;
  note: string | null;
  txHash: string | null;
  status: TransferStatus;
  sender: { id: string; fullName: string | null };
  receiver: { id: string; fullName: string | null };
  createdAt: string;
}

export interface TransferHistoryItem {
  id: string;
  amount: string;
  token: TokenType;
  note: string | null;
  txHash: string | null;
  status: TransferStatus;
  direction: 'SENT' | 'RECEIVED';
  otherParty: { id: string; fullName: string | null };
  createdAt: string;
}
