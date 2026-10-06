import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BookFormatSectionProps {
  label: string;
  formatName: string;
  formatNumber: string;
  children: ReactNode;
  className?: string;
  surface?: 'paper' | 'parchment' | 'cream' | 'forest-soft';
}

/**
 * Shared wrapper that labels each demo format so the client can tell
 * them apart while staying inside one library brand.
 */
export function BookFormatSection({
  label,
  formatName,
  formatNumber,
  children,
  className,
  surface = 'paper',
}: BookFormatSectionProps) {
  const surfaces = {
    paper: 'bg-paper',
    parchment: 'bg-parchment',
    cream: 'bg-cream',
    'forest-soft': 'bg-forest-soft/40',
  };

  return (
    <section
      className={cn(
        'border-b border-line',
        surfaces[surface],
        className
      )}
      aria-labelledby={`format-${formatNumber}-title`}
    >
      <div className="container-page pt-12 sm:pt-14 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
              Format {formatNumber}
            </p>
            <h2
              id={`format-${formatNumber}-title`}
              className="mt-2 font-cinzel text-xl sm:text-2xl font-semibold tracking-wide text-ink-900"
            >
              {formatName}
            </h2>
          </div>
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink-400">
            {label}
          </span>
        </div>
      </div>
      <div className="container-page pb-14 sm:pb-16 lg:pb-20">{children}</div>
    </section>
  );
}
