import { CircleAlert, RefreshCw, TrainFront, WifiOff } from 'lucide-react';
import type { Departure } from '../data';
import type { TrainData } from '../api/trains';
import { Card } from './Card';

type TrainDeparturesProps = {
  data: TrainData;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

function DepartureRow({ departure }: { departure: Departure }) {
  const isLate = departure.status === 'verspätet';
  const isCancelled = departure.status === 'ausfall';

  return (
    <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl px-3 py-2.5 ring-1 transition ${isCancelled ? 'bg-rose-50/90 ring-rose-100' : 'bg-white/82 ring-slate-100'}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${isCancelled ? 'bg-rose-600' : 'bg-slate-950'}`}>
        <span className="text-xs font-bold">{departure.line}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{departure.direction}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Gleis {departure.platform} · {isCancelled ? 'Ausfall' : isLate ? `+${departure.delay} Min.` : 'pünktlich'}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-lg font-semibold tabular-nums text-slate-950">{departure.time}</p>
        <p className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${isCancelled ? 'bg-rose-100 text-rose-700' : isLate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {(isLate || isCancelled) && <CircleAlert size={11} />}
          {departure.status}
        </p>
      </div>
    </div>
  );
}

function DirectionBlock({ title, items }: { title: string; items: Departure[] }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
        <TrainFront size={18} /> {title}
      </h3>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.slice(0, 4).map((departure) => <DepartureRow key={`${departure.direction}-${departure.time}-${departure.platform}`} departure={departure} />)
        ) : (
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500 ring-1 ring-slate-100">Keine Abfahrt in den nächsten Stunden gefunden.</div>
        )}
      </div>
    </div>
  );
}

export function TrainDepartures({ data, loading, error, onRefresh }: TrainDeparturesProps) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Büttgen S</p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">Nächste S8-Abfahrten</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${data.source === 'live' && !error ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {data.source === 'live' && !error ? 'Live' : 'Fallback'}
          </span>
          <span>{timeFormatter.format(new Date(data.fetchedAt))}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Neu laden
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-100">
          <WifiOff className="mt-0.5 shrink-0" size={16} />
          <div>
            <p className="font-semibold">S8-Livedaten konnten nicht geladen werden.</p>
            <p className="mt-1 text-amber-800">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <DirectionBlock title="Richtung Düsseldorf / Wuppertal" items={data.toDuesseldorf} />
        <DirectionBlock title="Richtung Mönchengladbach" items={data.toMoenchengladbach} />
      </div>
    </Card>
  );
}
