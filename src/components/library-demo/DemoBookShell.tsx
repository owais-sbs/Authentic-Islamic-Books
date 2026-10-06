import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DemoBookShellProps {
  number: string;
  formatName: string;
  title: string;
  children: ReactNode;
  surface?: 'paper' | 'parchment' | 'cream' | 'forest-soft';
}

/** Clean professional wrapper for a single opened demo book — consistent on mobile. */
export function DemoBookShell({
  number,
  formatName,
  title,
  children,
  surface = 'parchment',
}: DemoBookShellProps) {
  const surfaces = {
    paper: 'bg-paper',
    parchment: 'bg-parchment',
    cream: 'bg-cream',
    'forest-soft': 'bg-forest-soft/30',
  };

  return (
    <div className={cn('min-h-[70vh]', surfaces[surface])}>
      <div className="border-b border-line bg-cream/90">
        <div className="container-page py-3.5 sm:py-5">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-ink-600 transition-colors hover:text-accent-dark"
          >
            <ArrowLeft size={16} />
            Back to Library
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-2 sm:mt-4 sm:gap-3">
            <div className="min-w-0">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-dark sm:text-[11px] sm:tracking-[0.2em]">
                Format {number} · {formatName}
              </p>
              <h1 className="mt-1 font-cinzel text-lg font-semibold leading-snug tracking-wide text-ink-900 sm:text-2xl">
                {title}
              </h1>
            </div>
            <span className="hidden font-sans text-[11px] uppercase tracking-[0.14em] text-ink-400 sm:inline">
              Static demonstration
            </span>
          </div>
        </div>
      </div>

      <div className="container-page py-8 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
