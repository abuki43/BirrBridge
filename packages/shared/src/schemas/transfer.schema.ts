import { z } from 'zod';

export const TransferRequestSchema = z.object({
  to: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
  note: z.string().max(200).optional(),
});

export type TransferRequest = z.infer<typeof TransferRequestSchema>;
