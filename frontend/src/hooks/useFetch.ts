import { useState, useEffect, useCallback } from "react";

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false); // 👈 start false
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchFn();
      setData(res);
      return res;
    } catch (err: unknown) {
      let message = "Error";

      if (err instanceof Error) {
        message = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const maybeAxiosError = err as {
          response?: { data?: { error?: string } };
        };

        message =
          maybeAxiosError.response?.data?.error ?? message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: execute };
}