import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReaderSelect } from '@/components/reader/ReaderSelect';
import { cn } from '@/lib/utils';
import type { ReaderPage } from '@/lib/readerPages';

interface ReaderPageNavProps {
  pages: ReaderPage[];
  pageNumber: number;
  volumeLabel?: string;
  /** Optional chapter / section label shown under the controls */
  chapterLabel?: string;
  onChangePage: (page: number) => void;
  className?: string;
}

/**
 * Page / volume controls below the reading text.
 * Uses custom dropdowns (not native mobile <select>).
 */
export function ReaderPageNav({
  pages,
  pageNumber,
  volumeLabel = 'Single volume',
  chapterLabel,
  onChangePage,
  className,
}: ReaderPageNavProps) {
  const total = pages.length;
  const canPrev = pageNumber > 1;
  const canNext = pageNumber < total;

  const pageOptions = useMemo(
    () =>
      pages.map((p) => ({
        value: String(p.pageNumber),
        label: `Page ${p.pageNumber}`,
      })),
    [pages],
  );

  const volumeOptions = useMemo(
    () => [{ value: volumeLabel, label: volumeLabel }],
    [volumeLabel],
  );

  return (
    <nav
      className={cn(
        'reader-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
        className,
      )}
      aria-label="Page navigation"
    >
      {chapterLabel && (
        <p className="mb-2 truncate text-center text-[11px] reader-muted">{chapterLabel}</p>
      )}
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onChangePage(pageNumber - 1)}
          className="touch-target inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] ring-1 ring-black/8 disabled:opacity-35"
          style={{ color: 'var(--reader-text)' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <ReaderSelect
          label="Volume"
          value={volumeLabel}
          options={volumeOptions}
          onChange={() => {
            /* single-volume for now */
          }}
          wide
        />

        <ReaderSelect
          label="Page"
          value={String(pageNumber)}
          options={pageOptions}
          onChange={(v) => onChangePage(Number(v))}
        />

        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onChangePage(pageNumber + 1)}
          className="touch-target inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-ink-900 shadow-sm disabled:opacity-35"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[11px] reader-muted tabular-nums">
        Page {pageNumber} of {total}
      </p>
    </nav>
  );
}
