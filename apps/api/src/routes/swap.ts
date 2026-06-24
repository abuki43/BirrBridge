import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { SwapQuoteRequestSchema, SwapExecRequestSchema } from '@repo/shared';
import { authMiddleware } from '../middleware/auth.js';
import { getRate, createQuote, executeSwap, getSwapHistory, getSwapDetail, SwapError } from '../services/swap.service.js';

const app = new Hono();

app.use(authMiddleware);

// GET /api/v1/swap/rate
app.get('/rate', async (c) => {
  const result = await getRate();
  return c.json({ token: 'USDC', ...result });
});

// POST /api/v1/swap/quote
app.post('/quote', zValidator('json', SwapQuoteRequestSchema), async (c) => {
  const { amount } = c.req.valid('json');
  const userId = c.get('dbUserId');

  try {
    const quote = await createQuote(userId, amount);
    return c.json(quote, 201);
  } catch (err) {
    if (err instanceof SwapError) return c.json({ error: err.message }, 422);
    throw err;
  }
});

// POST /api/v1/swap/exec
app.post('/exec', zValidator('json', SwapExecRequestSchema), async (c) => {
  const { quoteId, bankAccountId } = c.req.valid('json');
  const userId = c.get('dbUserId');
  const privyUserId = c.get('privyUserId');

  try {
    const result = await executeSwap(userId, privyUserId, quoteId, bankAccountId);
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof SwapError) return c.json({ error: err.message }, 422);
    throw err;
  }
});

// GET /api/v1/swap/history
app.get(
  '/history',
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const userId = c.get('dbUserId');
    const result = await getSwapHistory(userId, page, limit);
    return c.json(result);
  }
);

// GET /api/v1/swap/:id
app.get('/:id', async (c) => {
  const userId = c.get('dbUserId');
  try {
    const result = await getSwapDetail(c.req.param('id'), userId);
    return c.json(result);
  } catch (err) {
    if (err instanceof SwapError) return c.json({ error: err.message }, 404);
    throw err;
  }
});

export default app;
