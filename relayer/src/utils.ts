export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = 3
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${String(lastError)}`);
}

export function computeDelta(current: number, previous: number | null): number {
  if (previous === null || previous === 0) return 0;
  return (current - previous) / Math.abs(previous);
}

export function normalizeDelta(delta: number): number {
  return Math.min(1, Math.abs(delta));
}

/** CosmWasm Decimal string — never scientific notation (e.g. 1e-15) */
export function toCosmosDecimal(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) < 1e-10) return "0";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const trimmed = abs
    .toFixed(18)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");

  return sign + (trimmed === "" ? "0" : trimmed);
}
