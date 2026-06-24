export interface BaseActivity {
  id: string;
  type: 'deposit' | 'transfer' | 'swap';
  amount: string;
  token: 'USDC';
  status: string;
  createdAt: string;
}

export interface DepositActivity extends BaseActivity {
  type: 'deposit';
  fromAddress: string;
  txHash: string;
}

export interface TransferActivity extends BaseActivity {
  type: 'transfer';
  direction: 'SENT' | 'RECEIVED';
  otherParty: { id: string; fullName: string | null };
  note: string | null;
  txHash: string | null;
}

export interface SwapActivity extends BaseActivity {
  type: 'swap';
  netETB: string;
  appliedRate: string;
  txHash: string | null;
  chapaRef: string | null;
}

export type ActivityItem = DepositActivity | TransferActivity | SwapActivity;
