/**
 * Formats a numeric count into a compact, human-readable string.
 *
 * Examples:
 *   0       → "0"
 *   999     → "999"
 *   1000    → "1K"
 *   1200    → "1.2K"
 *   10000   → "10K"
 *   100000  → "100K"
 *   1000000 → "1M"
 *   1500000 → "1.5M"
 */
export function formatCount(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "0";
  if (n < 0) return "0";

  if (n < 1_000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1_000;
    return k >= 10 ? `${Math.floor(k)}K` : `${+k.toFixed(1)}K`;
  }
  if (n < 1_000_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.floor(m)}M` : `${+m.toFixed(1)}M`;
  }
  const b = n / 1_000_000_000;
  return b >= 10 ? `${Math.floor(b)}B` : `${+b.toFixed(1)}B`;
}
