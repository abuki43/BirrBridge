import { createMiddleware } from 'hono/factory';
import { redis } from '../config/redis.js';

// 10 requests per 10 seconds per user
const LIMIT = 10;
const WINDOW = 10;

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get('userId');
  if (!userId) return next();

  const key = `rl:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW);
  }

  if (count > LIMIT) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  await next();
});
