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
