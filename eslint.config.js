import { useCallback, useEffect, useState } from 'react';
import { fallbackTrainData, fetchTrainDepartures, type TrainData } from '../api/trains';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useTrains() {
  const [data, setData] = useState<TrainData>(fallbackTrainData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(fallbackTrainData.error ?? null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await fetchTrainDepartures();
      setData(nextData);
      setError(nextData.error ?? null);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Abfahrten konnten nicht geladen werden.';
      setData({ ...fallbackTrainData, fetchedAt: new Date().toISOString(), error: message });
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
