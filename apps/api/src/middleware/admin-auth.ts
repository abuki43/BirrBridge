import { createMiddleware } from 'hono/factory';
import { verifyAdminToken } from '../services/admin.service.js';

export const adminAuthMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const payload = verifyAdminToken(token);
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401);

  c.set('adminId', payload.adminId);
  c.set('adminRole', payload.role);
  await next();
});
