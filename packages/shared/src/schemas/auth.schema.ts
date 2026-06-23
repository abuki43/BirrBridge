import { z } from 'zod';

export const PrivyWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email: z.object({
        address: z.string().email(),
    }).optional(),
    phone: z.object({
        number: z.string(),
    }).optional(),
    linked_accounts: z.array(z.any()),
  }),
});

export type PrivyWebhook = z.infer<typeof PrivyWebhookSchema>;
