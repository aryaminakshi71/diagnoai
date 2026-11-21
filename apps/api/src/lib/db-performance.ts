/**
 * Lightweight query performance tracking.
 *
 * Records the last N query durations in memory and logs anything slower than
 * SLOW_QUERY_MS. Works without pg_stat_statements, so it is useful in
 * serverless environments where the extension is unavailable.
 */

interface QueryMetric {
  name: string;
  duration: number;
  timestamp: number;
  error?: string;
}

const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS || 500);
const MAX_METRICS = 1000;
const metrics: QueryMetric[] = [];

function record(metric: QueryMetric) {
  metrics.push(metric);
  if (metrics.length > MAX_METRICS) metrics.shift();
}

export async function trackQuery<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    record({ name, duration, timestamp: Date.now() });
    if (duration > SLOW_QUERY_MS) {
      console.warn(`[Slow Query] ${name} took ${duration}ms`);
    }
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    record({
      name,
      duration,
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    throw err;
  }
}

export function getSlowQueries(thresholdMs = SLOW_QUERY_MS): QueryMetric[] {
  return metrics.filter((m) => m.duration > thresholdMs);
}

export function getQueryStats() {
  if (metrics.length === 0) {
    return { count: 0, avgMs: 0, p95Ms: 0, maxMs: 0, slow: 0 };
  }
  const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);
  const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;
  return {
    count: durations.length,
    avgMs: Math.round((sum / durations.length) * 100) / 100,
    p95Ms: p95,
    maxMs: durations[durations.length - 1],
    slow: getSlowQueries().length,
  };
}
