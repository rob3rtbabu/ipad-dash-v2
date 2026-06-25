import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import type { WarningData, WeatherWarning, WarningTone } from '../api/dwd';
import { Card } from './Card';

type AlertsPanelProps = {
  data: WarningData;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function toneClasses(tone: WarningTone) {
  switch (tone) {
    case 'extreme':
      return 'bg-rose-100 text-rose-800 ring-rose-200';
    case 'severe':
      return 'bg-orange-100 text-orange-800 ring-orange-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 ring-amber-200';
    case 'info':
      return 'bg-sky-100 text-sky-800 ring-sky-200';
    default:
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
  }
}

function iconForWarning(warning: WeatherWarning) {
  if (warning.tone === 'ok') return <ShieldCheck size={19} />;
  if (warning.tone === 'extreme' || warning.tone === 'severe') return <ShieldAlert size={19} />;
  if (warning.event.toLowerCase().includes('gewitter')) return <Zap size={19} />;
  return <AlertTriangle size={19} />;
}

export function AlertsPanel({ data, loading, error, onRefresh }: AlertsPanelProps) {
  const hasWarnings = data.warnings.length > 0;
  const visibleWarnings: WeatherWarning[] = hasWarnings
    ? data.warnings
    : [
        {
          id: 'no-live-warning',
          title: 'Keine DWD-Warnung aktiv',
          event: 'Entwarnung',
          region: data.regionLabel,
          description: 'Für Kaarst beziehungsweise den Rhein-Kreis Neuss wurde in der aktuellen DWD-Antwort keine aktive Warnung gefunden.',
          start: data.fetchedAt,
          end: data.fetchedAt,
          level: 0,
          tone: 'ok',
        },
      ];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Warnungen</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">DWD</h2>
          <p className="mt-1 text-sm text-slate-500">{data.regionLabel}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Prüfen
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 ${error ? 'bg-amber-100 text-amber-700' : data.source === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {error ? 'Fallback' : data.source === 'live' ? 'Live' : 'Fallback'}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          Stand {timeFormatter.format(new Date(data.fetchedAt))}
        </span>
      </div>

      {error ? (
        <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-100">
          DWD-Liveabfrage nicht erfolgreich: {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {visibleWarnings.map((warning) => (
          <div key={warning.id} className="rounded-3xl bg-slate-50/90 p-4 ring-1 ring-slate-100">
            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClasses(warning.tone)}`}>
                {warning.tone === 'ok' ? <CheckCircle2 size={19} /> : iconForWarning(warning)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{warning.title}</p>
                  {warning.level > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Stufe {warning.level}</span> : null}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">{warning.region}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{warning.description}</p>
                {warning.instruction ? <p className="mt-2 text-sm leading-6 text-slate-500">{warning.instruction}</p> : null}
                {warning.level > 0 ? (
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {timeFormatter.format(new Date(warning.start))} bis {timeFormatter.format(new Date(warning.end))}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
