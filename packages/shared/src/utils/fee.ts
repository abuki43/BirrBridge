export interface SwapQuoteInput {
  tokenAmount: string;    // e.g. "100"
  rate: string;           // ETB per 1 USDC e.g. "130.5000"
  feePercentage: string;  // e.g. "1.00"
}

export interface SwapQuoteOutput {
  tokenAmount: string;      // "100.000000"
  feeTokenAmount: string;   // "1.000000"
  netTokenAmount: string;   // "99.000000"
  appliedRate: string;      // "130.5000"
  grossETB: string;         // "13050.00"
  feeETB: string;           // "130.50"
  netETB: string;           // "12919.50"
  feePercentage: string;    // "1.00"
}

export function calculateSwapQuote(input: SwapQuoteInput): SwapQuoteOutput {
  const amount = parseFloat(input.tokenAmount);
  const rate = parseFloat(input.rate);
  const feePercent = parseFloat(input.feePercentage);

  const feeTokenAmount = (feePercent / 100) * amount;
  const netTokenAmount = amount - feeTokenAmount;
  const grossETB = amount * rate;
  const feeETB = feeTokenAmount * rate;
  const netETB = netTokenAmount * rate;

  return {
    tokenAmount: amount.toFixed(6),
    feeTokenAmount: feeTokenAmount.toFixed(6),
    netTokenAmount: netTokenAmount.toFixed(6),
    appliedRate: rate.toFixed(4),
    grossETB: grossETB.toFixed(2),
    feeETB: feeETB.toFixed(2),
    netETB: netETB.toFixed(2),
    feePercentage: feePercent.toFixed(2),
  };
}
