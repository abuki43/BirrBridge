import { Hono } from 'hono';
import { PrivyClient } from '@privy-io/server-auth';
import { PrivyWebhookSchema } from '@repo/shared';
import { prisma } from '@repo/db';

const app = new Hono();
const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!);

app.post('/', async (c) => {
  const payload = await c.req.json();
  const validated = PrivyWebhookSchema.parse(payload);
  
  const user = await prisma.user.upsert({
    where: { privyId: validated.data.id },
    create: {
      privyId: validated.data.id,
      email: validated.data.email?.address,
      phone: validated.data.phone?.number,
    },
    update: {},
  });
  
  return c.json({ ok: true, user });
});

export default app;
