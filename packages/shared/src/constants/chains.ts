export const CHAINS = {
  BASE_MAINNET: {
    id: 8453,
    name: 'Base',
    explorerUrl: 'https://basescan.org',
    alchemyRpcSubdomain: 'base-mainnet',
    isTestnet: false,
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    explorerUrl: 'https://sepolia.basescan.org',
    alchemyRpcSubdomain: 'base-sepolia',
    isTestnet: true,
  },
} as const;

export type ChainKey = keyof typeof CHAINS;

export function getChainById(chainId: number) {
  return Object.values(CHAINS).find((c) => c.id === chainId) ?? null;
}
