import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  subtle?: boolean;
};

export function Card({ children, className = '', subtle = false }: CardProps) {
  return (
    <section
      className={`rounded-[2rem] border border-white/80 ${subtle ? 'bg-white/55' : 'bg-white/78'} p-5 shadow-[0_24px_70px_rgba(80,120,160,0.13)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </section>
  );
}
