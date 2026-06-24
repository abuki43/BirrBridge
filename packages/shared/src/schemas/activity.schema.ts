import { z } from 'zod';

export const ActivityQuerySchema = z.object({
  type: z.enum(['deposit', 'transfer', 'swap']).optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;
