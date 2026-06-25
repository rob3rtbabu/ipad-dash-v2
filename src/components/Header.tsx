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
    <header className="flex flex-col gap-3 rounded-[1.45rem] border border-white/80 bg-white/72 p-4 shadow-[0_18px_54px_rgba(79,123,167,0.12)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner">
          <Home size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Büttgen Zuhause</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{greeting(now)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <CalendarDays size={15} /> {dateFormatter.format(now)} · Hubertusstraße
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <div className={`rounded-2xl px-3 py-2 ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"><Wifi size={14} /> {online ? 'Online' : 'Offline'}</div>
          <p className={`mt-0.5 text-xs ${online ? 'text-emerald-900' : 'text-rose-900'}`}>PWA bereit</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-white">
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-300"><RefreshCw size={14} /> Update</div>
          <p className="mt-0.5 font-mono text-xs tabular-nums">alle 15 Min.</p>
        </div>
      </div>
    </header>
  );
}
