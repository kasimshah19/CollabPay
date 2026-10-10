import { useState, useCallback } from "react";
import { ApiError } from "./api";

interface UseAsyncOptions<T> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError | Error) => void;
}

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.autoFetch ?? true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const error = err as (ApiError | Error);
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
}
