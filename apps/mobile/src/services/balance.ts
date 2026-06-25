import { api } from '@/services/api';

export interface BalanceResponse {
  usdc: string;
  totalUSD: string;
  totalETB: string;
  rate: string;
}

export async function fetchBalance(): Promise<BalanceResponse> {
  return api.get('api/v1/user/balance').json<BalanceResponse>();
}
