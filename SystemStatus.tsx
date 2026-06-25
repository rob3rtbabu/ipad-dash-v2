import { CalendarDays, Home, RefreshCw, Wifi } from 'lucide-react';

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 5) return 'Gute Nacht';
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

type HeaderProps = {
  now: Date;
  online: boolean;
};

export function Header({ now, online }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_30px_90px_rgba(79,123,167,0.16)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner">
          <Home size={25} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">Büttgen Zuhause</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{greeting(now)}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 sm:text-base">
            <CalendarDays size={17} /> {dateFormatter.format(now)} · Hubertusstraße, Büttgen
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        <div className={`rounded-2xl px-4 py-3 ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"><Wifi size={15} /> {online ? 'Online' : 'Offline'}</div>
          <p className={`mt-1 text-sm ${online ? 'text-emerald-900' : 'text-rose-900'}`}>PWA bereit</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><RefreshCw size={15} /> Update</div>
          <p className="mt-1 font-mono text-sm tabular-nums">alle 15 Min.</p>
        </div>
      </div>
    </header>
  );
}
