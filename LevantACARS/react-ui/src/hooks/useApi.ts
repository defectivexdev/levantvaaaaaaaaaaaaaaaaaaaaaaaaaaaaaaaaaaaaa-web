import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, onSuccess, onError, autoFetch = true } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  const refetch = useCallback(() => execute(), [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}

export function usePolling<T>(
  apiCall: () => Promise<T>,
  interval: number = 5000,
  options: UseApiOptions<T> = {}
) {
  const api = useApi(apiCall, options);

  useEffect(() => {
    if (!options.autoFetch) return;

    const timer = setInterval(() => {
      api.refetch();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, options.autoFetch, api]);

  return api;
}
