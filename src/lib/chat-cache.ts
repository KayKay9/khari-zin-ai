const cache = new Map<string, { at: number; payload: unknown }>();
const MAX = 50;
const TTL_MS = 1000 * 60 * 30;

export function makeCacheKey(locale: string, message: string, tripHash: string) {
  return `${locale}::${message.trim().toLowerCase()}::${tripHash}`;
}

export function tripHash(value: unknown) {
  return JSON.stringify(value ?? {});
}

export function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.payload as T;
}

export function cacheSet(key: string, payload: unknown) {
  if (cache.size >= MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, { at: Date.now(), payload });
}
