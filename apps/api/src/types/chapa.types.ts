export interface ChapaTransferRequest {
  account_name: string;
  account_number: string;
  amount: string;
  currency?: string;
  reference?: string;
  bank_code: number;
  status?: string;
}

export interface ChapaTransferResponse {
  message: string;
  status: string;
  data: {
    reference: string;
    chapa_reference: string;
    amount: number;
    currency: string;
    status: string;
    bank_code: number;
    account_number: string;
    account_name: string;
    created_at: string;
  };
}

export interface ChapaVerifyResponse {
  message: string;
  status: string;
  data: {
    reference: string;
    chapa_reference: string;
    amount: number;
    currency: string;
    status: string;
    bank_code: number;
    account_number: string;
    account_name: string;
    bank_name: string;
    charge: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ChapaBalanceResponse {
  message: string;
  status: string;
  data: {
    currency: string;
    available_balance: number;
    ledger_balance: number;
  }[];
}

export interface ChapaBank {
  id: number;
  name: string;
  swift: string | null;
}

export interface ChapaBanksResponse {
  message: string;
  status: string;
  data: ChapaBank[];
}

export interface ChapaPayoutWebhookPayload {
  event: string;
  type: string;
  account_name: string;
  account_number: string;
  bank_id: number;
  bank_name: string;
  amount: string;
  charge: string;
  currency: string;
  status: string;
  reference: string;
  chapa_reference: string;
  bank_reference: string;
  created_at: string;
  updated_at: string;
}
