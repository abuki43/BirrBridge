export function formatUSDC(amount: string | number): string {
  return parseFloat(String(amount)).toFixed(6);
}

export function formatETB(amount: string | number): string {
  return new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(String(amount)));
}

export function shortenAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}
