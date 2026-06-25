import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, Gauge, Loader2, RefreshCw, Sunrise, Sunset, SunMedium, ThermometerSun, Umbrella, Wind } from 'lucide-react';
import type { WeatherData, WeatherMetric } from '../api/weather';
import { Card } from './Card';

function WeatherIcon({ icon, size = 42 }: { icon: string; size?: number }) {
  if (icon === 'sun') return <SunMedium size={size} />;
  if (icon === 'cloud') return <Cloud size={size} />;
  if (icon === 'rain') return <CloudRain size={size} />;
  if (icon === 'storm') return <CloudLightning size={size} />;
  if (icon === 'snow') return <CloudSnow size={size} />;
  if (icon === 'fog') return <CloudFog size={size} />;
  return <CloudSun size={size} />;
}

function MetricIcon({ metric }: { metric: WeatherMetric }) {
  const props = { size: 20 };
  if (metric.icon === 'temperature') return <ThermometerSun {...props} />;
  if (metric.icon === 'umbrella') return <Umbrella {...props} />;
  if (metric.icon === 'uv') return <SunMedium {...props} />;
  if (metric.icon === 'wind') return <Wind {...props} />;
  if (metric.icon === 'humidity') return <Droplets {...props} />;
  if (metric.icon === 'pressure') return <Gauge {...props} />;
  if (metric.icon === 'sunrise') return <Sunrise {...props} />;
  if (metric.icon === 'sunset') return <Sunset {...props} />;
  return <CloudSun {...props} />;
}

type WeatherOverviewProps = {
  weather: WeatherData;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function WeatherOverview({ weather, loading, error, onRefresh }: WeatherOverviewProps) {
  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Aktuelles Wetter</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${weather.source === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {weather.source === 'live' ? 'Live' : 'Fallback'}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-4">
            <span className="text-7xl font-semibold tracking-tighter text-slate-950">{weather.current.temperature}°</span>
            <div className="pb-2">
              <p className="text-xl font-semibold text-slate-800">{weather.current.condition.label}</p>
              <p className="text-sm text-slate-500">
                Hubertusstraße, Büttgen · {weather.source === 'live' ? 'Open-Meteo' : 'Mock-Daten'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-100 transition hover:scale-105 hover:text-sky-700"
            onClick={onRefresh}
            aria-label="Wetter aktualisieren"
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          </button>
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-amber-100 to-sky-100 text-amber-500 shadow-inner">
            <WeatherIcon icon={weather.current.condition.icon} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
          Live-Wetter konnte nicht geladen werden. Die App zeigt Fallback-Daten. Fehler: {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {weather.metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl bg-slate-50/90 p-4 ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-slate-400"><MetricIcon metric={metric} /><span className="text-xs font-semibold uppercase tracking-[0.18em]">{metric.label}</span></div>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
