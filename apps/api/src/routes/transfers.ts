import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { TransferRequestSchema } from '@repo/shared';
import { authMiddleware } from '../middleware/auth.js';
import { sendTransfer, getTransferHistory, TransferError } from '../services/transfer.service.js';

const app = new Hono();

app.use(authMiddleware);

// POST /api/v1/transfers
app.post('/', zValidator('json', TransferRequestSchema), async (c) => {
  const { to, amount, note } = c.req.valid('json');
  const dbUserId = c.get('dbUserId');
  const privyUserId = c.get('privyUserId');

  try {
    const result = await sendTransfer({
      senderDbUserId: dbUserId,
      senderPrivyUserId: privyUserId,
      to,
      amount,
      note,
    });
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof TransferError) {
      return c.json({ error: err.message }, 422);
    }
    throw err;
  }
});

// GET /api/v1/transfers
app.get(
  '/',
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const userId = c.get('dbUserId');
    const result = await getTransferHistory(userId, page, limit);
    return c.json(result);
  }
);

export default app;
