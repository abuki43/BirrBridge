import { z } from 'zod';

export const SwapQuoteRequestSchema = z.object({
  token: z.enum(['USDC']).default('USDC'),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount'),
});

export const SwapExecRequestSchema = z.object({
  quoteId: z.string().min(1),
  bankAccountId: z.string().min(1),
});

export type SwapQuoteRequest = z.infer<typeof SwapQuoteRequestSchema>;
export type SwapExecRequest = z.infer<typeof SwapExecRequestSchema>;
