import { createMiddleware } from 'hono/factory';
import crypto from 'crypto';

export const requestIdMiddleware = createMiddleware(async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);

  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  console.log(JSON.stringify({
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
  }));
});
