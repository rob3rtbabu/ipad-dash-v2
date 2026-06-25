import type { ReactNode } from 'react';

type StatusCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: string;
};

export function StatusCard({ icon, title, subtitle, value }: StatusCardProps) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-sky-100/70 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">{icon}</div>
        <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{value}</span>
      </div>
      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-500">{subtitle}</p>
    </article>
  );
}
