export interface AdminJwtPayload {
  adminId: string;
  role: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalDepositVolume: string;
  totalTransfers: number;
  totalSwaps: number;
  totalSwapVolume: string;
  feesCollected: string;
  todayStats: {
    newUsers: number;
    deposits: number;
    swaps: number;
    transfers: number;
    swapVolume: string;
  };
}

export interface AuditLogInput {
  action: string;
  performedBy: string;
  targetType?: string;
  targetId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}
