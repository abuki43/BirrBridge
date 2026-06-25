import { useQuery } from '@tanstack/react-query';
import { fetchBalance, type BalanceResponse } from '@/services/balance';

export function useBalance() {
  return useQuery<BalanceResponse>({
    queryKey: ['balance'],
    queryFn: fetchBalance,
    refetchInterval: 10_000,
  });
}
