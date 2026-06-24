import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { loginAdmin } from '../../services/admin.service.js';

const app = new Hono();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/v1/admin/auth/login
app.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const result = await loginAdmin(email, password);
  if (!result) return c.json({ error: 'Invalid credentials' }, 401);

  return c.json(result);
});

export default app;
