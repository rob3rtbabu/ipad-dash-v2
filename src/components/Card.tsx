import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  subtle?: boolean;
};

export function Card({ children, className = '', subtle = false }: CardProps) {
  return (
    <section
      className={`rounded-[1.45rem] border border-white/80 ${subtle ? 'bg-white/58' : 'bg-white/82'} p-4 shadow-[0_16px_46px_rgba(80,120,160,0.10)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </section>
  );
}
