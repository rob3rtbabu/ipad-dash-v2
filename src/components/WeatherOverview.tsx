import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, Gauge, Loader2, RefreshCw, Sunrise, Sunset, SunMedium, ThermometerSun, Umbrella, Wind } from 'lucide-react';
import type { HourForecast, WeatherData, WeatherMetric } from '../api/weather';
import { Card } from './Card';

function WeatherIcon({ icon, size = 34 }: { icon: string; size?: number }) {
  if (icon === 'sun') return <SunMedium size={size} />;
  if (icon === 'cloud') return <Cloud size={size} />;
  if (icon === 'rain') return <CloudRain size={size} />;
  if (icon === 'storm') return <CloudLightning size={size} />;
  if (icon === 'snow') return <CloudSnow size={size} />;
  if (icon === 'fog') return <CloudFog size={size} />;
  return <CloudSun size={size} />;
}

function MetricIcon({ metric }: { metric: WeatherMetric }) {
  const props = { size: 17 };
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

function ForecastPill({ item }: { item: HourForecast }) {
  return (
    <div className="min-w-20 rounded-2xl bg-gradient-to-b from-sky-50 to-white p-3 text-center ring-1 ring-sky-100">
      <p className="font-mono text-xs text-slate-500 tabular-nums">{item.time}</p>
      <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
        <WeatherIcon icon={item.condition.icon} size={17} />
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{item.temp}°</p>
      <p className="mt-0.5 text-[0.7rem] text-slate-500">{item.rain}% · UV {item.uv}</p>
    </div>
  );
}

export function WeatherOverview({ weather, loading, error, onRefresh }: WeatherOverviewProps) {
  const primaryMetrics = weather.metrics.slice(0, 4);
  const secondaryMetrics = weather.metrics.slice(4, 8);

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Wetter Büttgen</p>
            <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${weather.source === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {weather.source === 'live' ? 'Live' : 'Fallback'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-6xl font-semibold tracking-tighter text-slate-950 sm:text-7xl">{weather.current.temperature}°</span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-800">{weather.current.condition.label}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">gefühlt {weather.current.apparentTemperature}° · {weather.source === 'live' ? 'Open-Meteo' : 'Mock-Daten'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-amber-100 to-sky-100 text-amber-500 shadow-inner">
            <WeatherIcon icon={weather.current.condition.icon} />
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-100 transition hover:scale-105 hover:text-sky-700"
            onClick={onRefresh}
            aria-label="Wetter aktualisieren"
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
          Live-Wetter nicht geladen. Fallback aktiv: {error}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-slate-50/90 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-slate-400"><MetricIcon metric={metric} /><span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]">{metric.label}</span></div>
              <p className="mt-2 text-xl font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {secondaryMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-white">
              <div className="flex min-w-0 items-center gap-2 text-slate-500"><MetricIcon metric={metric} /><span className="truncate text-xs font-medium">{metric.label}</span></div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">{metric.value}</p>
                <p className="text-[0.68rem] text-slate-500">{metric.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl bg-white/65 p-3 ring-1 ring-white">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Heute · Stundenverlauf</h3>
            <p className="hidden text-xs text-slate-500 sm:block">Temperatur · Regen · UV</p>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {weather.hourly.slice(0, 8).map((item) => <ForecastPill key={item.time} item={item} />)}
          </div>
        </div>

        <div className="rounded-2xl bg-sky-50/80 p-3 ring-1 ring-sky-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Morgen</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">{weather.tomorrow.title}</h3>
          <div className="mt-2 grid gap-2">
            {weather.tomorrow.periods.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <p className="text-lg font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
