import { env } from '../env.js';
import { redis } from '../config/redis.js';
import type {
  ChapaTransferRequest,
  ChapaTransferResponse,
  ChapaVerifyResponse,
  ChapaBalanceResponse,
  ChapaBanksResponse,
} from '../types/index.js';
import { ChapaError } from '../errors/index.js';

const BASE = 'https://api.chapa.co/v1';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ChapaError(`Chapa ${method} ${path} failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function initiateTransfer(params: ChapaTransferRequest): Promise<ChapaTransferResponse> {
  return request<ChapaTransferResponse>('POST', '/transfers', {
    account_name: params.account_name,
    account_number: params.account_number,
    amount: params.amount,
    currency: params.currency ?? 'ETB',
    reference: params.reference,
    bank_code: params.bank_code,
  });
}

export async function verifyTransfer(reference: string): Promise<ChapaVerifyResponse> {
  return request<ChapaVerifyResponse>('GET', `/transfers/verify/${reference}`);
}

export async function getBalance(currency?: string): Promise<ChapaBalanceResponse> {
  const path = currency ? `/balances/${currency.toLowerCase()}` : '/balances';
  return request<ChapaBalanceResponse>('GET', path);
}

export async function fetchBanks(): Promise<{ id: number; name: string }[]> {
  const cached = await redis.get('chapa:banks');
  if (cached) {
    return JSON.parse(cached);
  }

  const res = await request<ChapaBanksResponse>('GET', '/banks');

  const banks = res.data ?? [];
  await redis.set('chapa:banks', JSON.stringify(banks), 86400);

  return banks;
}


