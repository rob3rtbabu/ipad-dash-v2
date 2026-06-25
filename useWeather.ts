import { AlertTriangle, CloudSun, TrainFront } from 'lucide-react';
import { Card } from './Card';

type SystemStatusProps = {
  weatherSource: 'live' | 'mock';
  weatherError: string | null;
  weatherFetchedAt: string;
  trainSource: 'live' | 'fallback' | 'cached';
  trainError: string | null;
  trainFetchedAt: string;
  warningSource: 'live' | 'fallback';
  warningError: string | null;
  warningFetchedAt: string;
};

const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function SystemStatus({ weatherSource, weatherError, weatherFetchedAt, trainSource, trainError, trainFetchedAt, warningSource, warningError, warningFetchedAt }: SystemStatusProps) {
  const items = [
    { label: 'Wetter', value: weatherError ? 'Fallback' : weatherSource === 'live' ? 'Live' : 'Mock', icon: <CloudSun size={18} /> },
    { label: 'Abfahrten', value: trainError ? 'Fallback' : trainSource === 'live' ? 'Live' : trainSource === 'cached' ? 'Letzte Daten' : 'Fallback', icon: <TrainFront size={18} /> },
    { label: 'Warnungen', value: warningError ? 'Fallback' : warningSource === 'live' ? 'Live' : 'Fallback', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <Card subtle>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">System</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Status</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white">
            <div className="flex items-center gap-2 text-slate-700">{item.icon}<span className="font-medium">{item.label}</span></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.value === 'Live' ? 'bg-emerald-100 text-emerald-700' : item.value === 'Fallback' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 text-xs text-slate-500">
        <p>Wetter zuletzt aktualisiert: {timeFormatter.format(new Date(weatherFetchedAt))}</p>
        <p>Abfahrten zuletzt aktualisiert: {timeFormatter.format(new Date(trainFetchedAt))}</p>
        <p>DWD zuletzt aktualisiert: {timeFormatter.format(new Date(warningFetchedAt))}</p>
      </div>
    </Card>
  );
}
