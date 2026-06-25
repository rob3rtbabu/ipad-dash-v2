import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather, mockWeatherData, type WeatherData } from '../api/weather';

export type WeatherState = {
  data: WeatherData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastAttemptAt: string | null;
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useWeather(): WeatherState {
  const [data, setData] = useState<WeatherData>(mockWeatherData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptAt, setLastAttemptAt] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLastAttemptAt(new Date().toISOString());
    try {
      const live = await fetchWeather();
      if (!mounted.current) return;
      setData(live);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      const message = err instanceof Error ? err.message : 'Unbekannter Wetterfehler';
      setData((current) => ({ ...current, source: 'mock', fetchedAt: new Date().toISOString() }));
      setError(message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const interval = window.setInterval(() => void refresh(), FIFTEEN_MINUTES);
    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { data, loading, error, refresh, lastAttemptAt };
}
