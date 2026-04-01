import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/http';

interface Options<T> {
  fallbackData: T;
  path: string;
  cacheTtlMs?: number;
}

interface CacheEntry {
  data?: unknown;
  timestamp?: number;
  promise?: Promise<unknown>;
}

const publicDataCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL_MS = 45_000;

function getCachedData<T>(path: string) {
  const entry = publicDataCache.get(path);
  return (entry?.data as T | undefined) ?? null;
}

function isCacheFresh(path: string, cacheTtlMs: number) {
  const entry = publicDataCache.get(path);
  if (entry?.timestamp == null) return false;
  return Date.now() - entry.timestamp < cacheTtlMs;
}

function setCachedData<T>(path: string, data: T) {
  const existing = publicDataCache.get(path);
  publicDataCache.set(path, {
    ...existing,
    data,
    timestamp: Date.now(),
    promise: undefined,
  });
}

async function fetchWithCache<T>(path: string): Promise<T> {
  const existing = publicDataCache.get(path);
  if (existing?.promise) {
    return existing.promise as Promise<T>;
  }

  const request = apiRequest<T>(path)
    .then((response) => {
      setCachedData(path, response);
      return response;
    })
    .finally(() => {
      const current = publicDataCache.get(path);
      if (current) {
        publicDataCache.set(path, { ...current, promise: undefined });
      }
    });

  publicDataCache.set(path, {
    ...existing,
    promise: request,
  });

  return request;
}

export async function prefetchPublicData<T>(path: string) {
  const cached = getCachedData<T>(path);
  if (cached !== null) return cached;
  return fetchWithCache<T>(path);
}

export function usePublicData<T>({ fallbackData, path, cacheTtlMs = DEFAULT_CACHE_TTL_MS }: Options<T>) {
  const [data, setData] = useState<T | null>(() => getCachedData<T>(path));
  const [loading, setLoading] = useState(() => getCachedData<T>(path) === null);
  const [error, setError] = useState<string | null>(null);
  const fallbackRef = useRef(fallbackData);

  useEffect(() => {
    fallbackRef.current = fallbackData;
  }, [fallbackData]);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedData<T>(path);

    if (cached !== null) {
      setData(cached);
      setLoading(false);
    } else {
      setData(null);
      setLoading(true);
    }

    async function load() {
      try {
        if (cached === null) {
          setLoading(true);
        }
        setError(null);
        if (cached !== null && isCacheFresh(path, cacheTtlMs)) {
          return;
        }
        const response = await fetchWithCache<T>(path);
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          if (cached === null) {
            setData(fallbackRef.current);
          }
          setError((err as Error).message || 'Failed to load dynamic content');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [cacheTtlMs, path]);

  return { data, loading, error, setData };
}
