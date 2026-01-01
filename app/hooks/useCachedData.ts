import { useState, useEffect } from 'react';

type CacheData<T> = {
    data: T;
    timestamp: number;
};

export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // Default 5 minutes
): { data: T | null; loading: boolean; error: any } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const cached = sessionStorage.getItem(key);
                if (cached) {
                    const parsed: CacheData<T> = JSON.parse(cached);
                    const now = Date.now();
                    if (now - parsed.timestamp < ttl) {
                        console.log(`[Cache Hit] ${key}`);
                        setData(parsed.data);
                        setLoading(false);
                        return;
                    }
                }

                console.log(`[Cache Miss] ${key}`);
                const freshData = await fetcher();
                setData(freshData);
                sessionStorage.setItem(
                    key,
                    JSON.stringify({ data: freshData, timestamp: Date.now() })
                );
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [key, ttl]); // Removed fetcher dependency to avoid loops if function ref changes

    return { data, loading, error };
}
