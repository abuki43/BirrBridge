import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ActivityQuerySchema } from '@repo/shared';
import { authMiddleware } from '../middleware/auth.js';
import { getActivityFeed } from '../services/activity.service.js';

const app = new Hono();

app.use(authMiddleware);

// GET /api/v1/activity
app.get('/', zValidator('query', ActivityQuerySchema), async (c) => {
  const userId = c.get('dbUserId');
  const result = await getActivityFeed(userId, c.req.valid('query'));
  return c.json(result);
});

export default app;
