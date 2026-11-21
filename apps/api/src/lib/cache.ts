/**
 * Cache helper for DiagnoAI.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set, otherwise
 * falls back to a small in-process TTL cache. The fallback is per-instance,
 * which is fine for local dev and single-instance demos; production should
 * set the Upstash env vars.
 */

type Entry = { value: unknown; expiresAt: number };

const memory = new Map<string, Entry>();

function memoryGet<T>(key: string): T | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  // Keep the map from growing without bound.
  if (memory.size > 1000) {
    const now = Date.now();
    for (const [k, v] of memory) {
      if (v.expiresAt < now) memory.delete(k);
    }
  }
}

async function redisGet<T>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    if (!data.result) return null;
    return JSON.parse(data.result) as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown, ttlSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}?EX=${ttlSeconds}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });
  } catch {
    // Cache writes are best-effort.
  }
}

/**
 * Return the cached value for `key`, or compute it, cache it, and return it.
 */
export async function getOrCache<T>(
  key: string,
  compute: () => Promise<T>,
  ttlSeconds = 300,
): Promise<T> {
  const fromRedis = await redisGet<T>(key);
  if (fromRedis !== null) return fromRedis;

  const fromMemory = memoryGet<T>(key);
  if (fromMemory !== null) return fromMemory;

  const value = await compute();
  memorySet(key, value, ttlSeconds);
  await redisSet(key, value, ttlSeconds);
  return value;
}

/** Invalidate a single key (best-effort). */
export async function invalidateCache(key: string) {
  memory.delete(key);
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore
  }
}
