export interface Beneficiary {
  accountNumber: string;
  bank: string;
  amount: number;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  paymentUrl: string;
  totalAmount: number;
}

export interface B2CTransferResponse {
  sessionId: string;
  transcation: number;
}

export interface SessionStatusResponse {
  transaction: {
    transactionStatus: string;
  };
}
