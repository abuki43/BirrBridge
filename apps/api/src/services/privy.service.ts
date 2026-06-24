import { PrivyClient } from '@privy-io/server-auth';
import { encodeFunctionData, parseUnits, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { TOKEN_CONTRACTS, CHAINS } from '@repo/shared';
import { env } from '../env.js';

export const privy = new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET, {
  walletApi: {
    authorizationPrivateKey: env.PRIVY_AUTHORIZATION_PRIVATE_KEY,
  },
});

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

const isMainnet = env.BASE_CHAIN_ID === 8453;

export const USDC_ADDRESS = (isMainnet
  ? TOKEN_CONTRACTS.BASE_MAINNET.USDC
  : TOKEN_CONTRACTS.BASE_SEPOLIA.USDC) as `0x${string}`;

export const chain = isMainnet ? base : baseSepolia;

const rpcSubdomain = isMainnet
  ? CHAINS.BASE_MAINNET.alchemyRpcSubdomain
  : CHAINS.BASE_SEPOLIA.alchemyRpcSubdomain;

export const publicClient = createPublicClient({
  chain,
  transport: http(`https://${rpcSubdomain}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`),
});

/** Get the smart wallet's linked account ID (used as walletId for transactions) */
export async function getUserWalletId(privyUserId: string): Promise<string | null> {
  const user = await privy.getUser(privyUserId);
  const smartWallet = user.linkedAccounts.find(
    (a: { type: string }) => a.type === 'smart_wallet'
  );
  return (smartWallet as { id?: string } | undefined)?.id ?? null;
}

/** Extract smart wallet address from Privy linked_accounts */
export function extractSmartWalletAddress(
  linkedAccounts: Array<{ type: string; address?: string }>
): string | null {
  const smartWallet = linkedAccounts.find((a) => a.type === 'smart_wallet');
  return smartWallet?.address ?? null;
}

/** Sponsored ERC-20 transfer — gas paid by Privy via app authorization key */
export async function sponsoredTransfer({
  senderWalletId,
  recipientAddress,
  amount,
}: {
  senderWalletId: string;
  recipientAddress: string;
  amount: string;
}): Promise<{ txHash: string | null; userOpHash: string | null }> {
  const data = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [recipientAddress as `0x${string}`, parseUnits(amount, 6)],
  });

  const result = await privy.walletApi.ethereum.sendTransaction({
    walletId: senderWalletId,
    caip2: `eip155:${env.BASE_CHAIN_ID}`,
    sponsor: true,
    transaction: {
      to: USDC_ADDRESS,
      data,
      value: '0x0',
    },
  });

  // When sponsor=true, txHash is empty and user_operation_hash is the real identifier
  return {
    txHash: result.hash || null,
    userOpHash: (result as { user_operation_hash?: string }).user_operation_hash || null,
  };
}

const alchemyRpcUrl = `https://${rpcSubdomain}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;

/** Poll for the actual transaction hash after a sponsored UserOperation is included
 *  Uses eth_getUserOperationReceipt (ERC-4337) via Alchemy RPC
 */
export async function waitForUserOpReceipt(
  userOpHash: string,
  maxWaitMs = 60_000,
  pollIntervalMs = 2_000,
): Promise<{ txHash: string } | null> {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(alchemyRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getUserOperationReceipt',
          params: [userOpHash],
        }),
      });

      const body = await res.json() as {
        result?: {
          receipt: { transactionHash: string };
          userOpHash: string;
          success: boolean;
        } | null;
      };

      const receipt = body?.result;
      if (receipt?.receipt?.transactionHash) {
        return { txHash: receipt.receipt.transactionHash };
      }
    } catch {
      // RPC error — poll again
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  return null;
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
