import { ArrowUpRight } from 'lucide-react';
import type { WeatherData } from '../api/weather';
import { Card } from './Card';

export function TomorrowCard({ weather }: { weather: WeatherData }) {
  return (
    <Card subtle>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Morgen</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{weather.tomorrow.title}</h2>
        </div>
        <div className="rounded-full bg-sky-100 p-3 text-sky-700"><ArrowUpRight size={20} /></div>
      </div>
      <div className="mt-5 grid gap-3">
        {weather.tomorrow.periods.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white">
            <div>
              <p className="font-medium text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-500">{item.detail}</p>
            </div>
            <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
