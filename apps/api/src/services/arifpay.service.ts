import { env } from '../env.js';

const BASE = env.ARIFPAY_BASE_URL;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'x-arifpay-key': env.ARIFPAY_API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ArifpayError(`ArifPay ${method} ${path} failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

interface Beneficiary {
  accountNumber: string;
  bank: string;
  amount: number;
}

interface CheckoutSessionResponse {
  sessionId: string;
  paymentUrl: string;
  totalAmount: number;
}

interface B2CTransferResponse {
  sessionId: string;
  transcation: number;
}

export async function createPayoutSession(
  beneficiaries: Beneficiary[],
  notifyUrl: string,
  nonce: string,
): Promise<CheckoutSessionResponse> {
  const expireDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return request<CheckoutSessionResponse>('POST', '/api/checkout/session', {
    nonce,
    notifyUrl,
    successUrl: notifyUrl,
    cancelUrl: notifyUrl,
    errorUrl: notifyUrl,
    paymentMethods: [],
    expireDate,
    items: beneficiaries.map((b) => ({
      name: 'USDC to ETB Payout',
      quantity: 1,
      price: b.amount,
    })),
    beneficiaries,
    lang: 'EN',
  });
}

export async function executeTeleBirrB2C(
  sessionId: string,
  phoneNumber: string,
): Promise<B2CTransferResponse> {
  const res = await fetch(`https://telebirr-b2c.arifpay.org/api/Telebirr/b2c/transfer`, {
    method: 'POST',
    headers: {
      'x-arifpay-key': env.ARIFPAY_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, phoneNumber }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ArifpayError(`Telebirr B2C failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getSessionStatus(sessionId: string): Promise<{ transaction: { transactionStatus: string } }> {
  return request('GET', `/api/checkout/session/${sessionId}`);
}

export class ArifpayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArifpayError';
  }
}
