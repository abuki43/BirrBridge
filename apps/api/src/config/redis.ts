import { env } from '../env.js';

interface RedisResponse<T> {
  result: T;
}

async function redisRequest<T>(command: string[]): Promise<T> {
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  const data = (await res.json()) as RedisResponse<T>;
  return data.result;
}

export const redis = {
  get: (key: string) => redisRequest<string | null>(['GET', key]),

  set: (key: string, value: string, ttlSeconds?: number) =>
    ttlSeconds
      ? redisRequest<string>(['SET', key, value, 'EX', String(ttlSeconds)])
      : redisRequest<string>(['SET', key, value]),

  del: (key: string) => redisRequest<number>(['DEL', key]),

  incr: (key: string) => redisRequest<number>(['INCR', key]),

  expire: (key: string, ttlSeconds: number) =>
    redisRequest<number>(['EXPIRE', key, String(ttlSeconds)]),
};
