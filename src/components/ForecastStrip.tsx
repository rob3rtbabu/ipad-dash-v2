import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, SunMedium } from 'lucide-react';
import type { HourForecast } from '../api/weather';
import { Card } from './Card';

function WeatherIcon({ icon }: { icon: string }) {
  if (icon === 'sun') return <SunMedium size={20} />;
  if (icon === 'cloud') return <Cloud size={20} />;
  if (icon === 'rain') return <CloudRain size={20} />;
  if (icon === 'storm') return <CloudLightning size={20} />;
  if (icon === 'snow') return <CloudSnow size={20} />;
  if (icon === 'fog') return <CloudFog size={20} />;
  return <CloudSun size={20} />;
}

export function ForecastStrip({ hourly }: { hourly: HourForecast[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Heute</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Stundenverlauf</h2>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">Temperatur · Regen · UV</p>
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hourly.map((item) => (
          <div key={item.time} className="min-w-28 rounded-3xl bg-gradient-to-b from-sky-50 to-white p-4 text-center ring-1 ring-sky-100">
            <p className="font-mono text-sm text-slate-500 tabular-nums">{item.time}</p>
            <div className="mx-auto mt-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm"><WeatherIcon icon={item.condition.icon} /></div>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{item.temp}°</p>
            <p className="mt-1 text-xs text-slate-500">{item.rain}% · UV {item.uv}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
