import { useEffect, useState } from 'react';
import { apiRequest } from '../api/http';

interface Options<T> {
  fallbackData: T;
  path: string;
}

export function usePublicData<T>({ fallbackData, path }: Options<T>) {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await apiRequest<T>(path);
        if (!cancelled) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setData(fallbackData);
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
  }, [fallbackData, path]);

  return { data, loading, error, setData };
}
