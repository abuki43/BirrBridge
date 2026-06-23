import { env } from '../env.js';

/** Add a user's smart wallet address to the Alchemy address-activity webhook */
export async function registerAddressWebhook(address: string): Promise<void> {
  const res = await fetch('https://dashboard.alchemy.com/api/update-webhook-addresses', {
    method: 'PATCH',
    headers: {
      'X-Alchemy-Token': env.ALCHEMY_WEBHOOK_AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhook_id: env.ALCHEMY_WEBHOOK_ID,
      addresses_to_add: [address],
      addresses_to_remove: [],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Alchemy webhook registration failed: ${text}`);
  }
}
