export const TOKEN_CONTRACTS = {
  BASE_MAINNET: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  BASE_SEPOLIA: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
} as const;

export const SWAP_LIMITS = {
  MIN_USDC: 10,
  MAX_USDC: 10_000,
} as const;

export const TRANSFER_LIMITS = {
  MIN_USDC: 1,
} as const;

export const PLATFORM_FEE_PERCENTAGE = '1.00';
