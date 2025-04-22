import { useEffect, useState } from "react";

const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  options?: {
    autoFetch?: boolean;
    dependencies?: any[];
  }
) => {
  const { autoFetch = true, dependencies = [] } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (autoFetch) {
      executeFetch();
    }

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
