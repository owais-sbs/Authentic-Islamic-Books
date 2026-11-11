import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReaderPage } from '@/lib/readerPages';

interface ReaderPageNavProps {
  pages: ReaderPage[];
  pageNumber: number;
  volumeLabel?: string;
  onChangePage: (page: number) => void;
  className?: string;
}

/**
 * Kutub-style bottom page controls: volume · page · prev/next.
 * Stays visible while reading (sticky/fixed footer bar).
 */
export function ReaderPageNav({
  pages,
  pageNumber,
  volumeLabel = 'Single volume',
  onChangePage,
  className,
}: ReaderPageNavProps) {
  const total = pages.length;
  const canPrev = pageNumber > 1;
  const canNext = pageNumber < total;

  return (
    <nav
      className={cn(
        'reader-card px-3 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-6px_20px_rgba(0,0,0,0.06)]',
        className,
      )}
      aria-label="Page navigation"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onChangePage(pageNumber - 1)}
          className="touch-target inline-flex items-center justify-center rounded-lg bg-black/[0.04] disabled:opacity-35"
          style={{ color: 'var(--reader-text)' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="relative min-w-0">
          <select
            className="h-10 max-w-[36vw] cursor-pointer appearance-none truncate rounded-lg bg-black/[0.04] py-2 pl-3 pr-8 text-[13px] font-semibold outline-none sm:max-w-[180px]"
            style={{ color: 'var(--reader-text)' }}
            value={volumeLabel}
            aria-label="Select volume"
            onChange={() => {
              /* single-volume books — reserved for future multi-volume */
            }}
          >
            <option value={volumeLabel}>{volumeLabel}</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60"
            aria-hidden
          />
        </div>

        <div className="relative min-w-0">
          <select
            className="h-10 max-w-[40vw] cursor-pointer appearance-none truncate rounded-lg bg-black/[0.04] py-2 pl-3 pr-8 text-[13px] font-semibold outline-none sm:max-w-[160px]"
            style={{ color: 'var(--reader-text)' }}
            value={pageNumber}
            onChange={(e) => onChangePage(Number(e.target.value))}
            aria-label="Select page"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.pageNumber}>
                Page {p.pageNumber}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60"
            aria-hidden
          />
        </div>

        <p className="hidden text-[11px] reader-muted sm:block tabular-nums">
          {pageNumber} / {total}
        </p>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onChangePage(pageNumber + 1)}
          className="touch-target inline-flex items-center justify-center rounded-lg bg-accent text-ink-900 disabled:opacity-35"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <p className="mt-1 text-center text-[11px] reader-muted sm:hidden tabular-nums">
        Page {pageNumber} of {total}
      </p>
    </nav>
  );
}
