/**
 * Format a number as Indian Rupees.
 * - ≥ 1 Crore → "₹ 1.20 Crore"
 * - ≥ 1 Lakh  → "₹ 8.45 Lakh"
 * - Below     → "₹ 75,000"  (Indian grouping)
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹ ${crores.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹ ${lakhs.toFixed(2)} Lakh`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

/** Raw ₹ with Indian grouping, e.g. "₹ 17,00,000" */
export function formatINRRaw(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
