import { createMiddleware } from 'hono/factory';
import { privy } from '../services/privy.service.js';
import { prisma } from '../config/prisma.js';

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const claims = await privy.verifyAuthToken(token);
    const privyUserId = claims.userId;

    const user = await prisma.user.findUnique({ where: { privyId: privyUserId } });
    if (!user) return c.json({ error: 'User not found' }, 404);
    if (user.status !== 'ACTIVE') return c.json({ error: 'Account suspended' }, 403);

    c.set('privyUserId', privyUserId);
    c.set('dbUserId', user.id);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
