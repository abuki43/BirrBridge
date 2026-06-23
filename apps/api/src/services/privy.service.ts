import { PrivyClient } from '@privy-io/server-auth';
import { encodeFunctionData, parseUnits, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { env } from '../env.js';

export const privy = new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET);

const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const;

export const USDC_ADDRESS = (env.BASE_CHAIN_ID === 8453
  ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  : '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as `0x${string}`;

export const chain = env.BASE_CHAIN_ID === 8453 ? base : baseSepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(
    `https://${env.BASE_CHAIN_ID === 8453 ? 'base-mainnet' : 'base-sepolia'}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`
  ),
});

/** Extract smart wallet address from Privy linked_accounts */
export function extractSmartWalletAddress(
  linkedAccounts: Array<{ type: string; address?: string }>
): string | null {
  const smartWallet = linkedAccounts.find((a) => a.type === 'smart_wallet');
  return smartWallet?.address ?? null;
}

/** Sponsored ERC-20 transfer — gas paid by Privy */
export async function sponsoredTransfer({
  senderWalletId,
  recipientAddress,
  amount,
}: {
  senderWalletId: string;
  recipientAddress: string;
  amount: string; // human-readable e.g. "25.00"
}): Promise<string> {
  const data = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [recipientAddress as `0x${string}`, parseUnits(amount, 6)],
  });

  const { hash } = await privy.walletApi.ethereum.sendTransaction({
    walletId: senderWalletId,
    caip2: `eip155:${env.BASE_CHAIN_ID}`,
    transaction: {
      to: USDC_ADDRESS,
      data,
      value: '0x0',
    },
  });

  return hash;
}

/** Get USDC balance for any address via Alchemy RPC */
export async function getUsdcBalance(address: string): Promise<bigint> {
  return publicClient.readContract({
    address: USDC_ADDRESS,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
      },
    ] as const,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });
}
