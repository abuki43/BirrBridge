import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono();

app.use(authMiddleware);

const BankAccountSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
});

// GET /api/user/bank-accounts
app.get('/', async (c) => {
  const accounts = await prisma.bankAccount.findMany({
    where: { userId: c.get('dbUserId') },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      isDefault: true,
      createdAt: true,
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return c.json(accounts);
});

// POST /api/user/bank-accounts
app.post('/', zValidator('json', BankAccountSchema), async (c) => {
  const data = c.req.valid('json');
  const userId = c.get('dbUserId');

  const count = await prisma.bankAccount.count({ where: { userId } });

  const account = await prisma.bankAccount.create({
    data: { ...data, userId, isDefault: count === 0 },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      isDefault: true,
    },
  });
  return c.json(account, 201);
});

// PUT /api/user/bank-accounts/:id/default
app.put('/:id/default', async (c) => {
  const userId = c.get('dbUserId');
  const { id } = c.req.param();

  const account = await prisma.bankAccount.findFirst({ where: { id, userId } });
  if (!account) return c.json({ error: 'Not found' }, 404);

  await prisma.$transaction([
    prisma.bankAccount.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.bankAccount.update({ where: { id }, data: { isDefault: true } }),
  ]);

  return c.json({ ok: true });
});

// DELETE /api/user/bank-accounts/:id
app.delete('/:id', async (c) => {
  const userId = c.get('dbUserId');
  const { id } = c.req.param();

  const account = await prisma.bankAccount.findFirst({ where: { id, userId } });
  if (!account) return c.json({ error: 'Not found' }, 404);

  await prisma.bankAccount.delete({ where: { id } });
  return c.json({ ok: true });
});

export default app;
