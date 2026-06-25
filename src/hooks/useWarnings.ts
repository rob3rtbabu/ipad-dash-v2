import { useCallback, useEffect, useState } from 'react';
import { fallbackWarningData, fetchDwdWarnings, type WarningData } from '../api/dwd';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useWarnings() {
  const [data, setData] = useState<WarningData>(fallbackWarningData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const liveData = await fetchDwdWarnings();
      setData(liveData);
      setError(null);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'DWD-Warnungen konnten nicht geladen werden.';
      setData({ ...fallbackWarningData, fetchedAt: new Date().toISOString() });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => void refresh(), FIFTEEN_MINUTES);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return { data, loading, error, refresh };
}
