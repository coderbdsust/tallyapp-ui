export function formatCurrency(amount: number): string {
  if (!amount) {
    return 'BDT 0';
  }
  return `BDT ${amount.toLocaleString()}`;
}
