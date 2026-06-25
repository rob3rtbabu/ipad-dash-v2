import { useCallback, useEffect, useState } from 'react';
import { fallbackTrainData, fetchTrainDepartures, type TrainData } from '../api/trains';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useTrains() {
  const [data, setData] = useState<TrainData>(fallbackTrainData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const liveData = await fetchTrainDepartures();
      setData(liveData);
      setError(null);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'S8-Daten konnten nicht geladen werden.';
      setData({ ...fallbackTrainData, fetchedAt: new Date().toISOString() });
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
