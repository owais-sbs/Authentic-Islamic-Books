import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Book } from '@/types';
import type { ReaderUnit } from '@/lib/readerSections';
import { BookCover } from '@/components/book/BookCover';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { cn } from '@/lib/utils';

interface ReaderSidebarProps {
  book: Book;
  units: ReaderUnit[];
  activeIndex: number;
  onSelect: (index: number) => void;
  tocLimit?: number;
  onShowAll?: () => void;
  showAll?: boolean;
  variant?: 'sidebar' | 'plain';
}

export function ReaderSidebar({
  book,
  units,
  activeIndex,
  onSelect,
  tocLimit = 11,
  onShowAll,
  showAll = false,
  variant = 'sidebar',
}: ReaderSidebarProps) {
  const scholar = getScholarById(book.authorId);
  const category = book.categoryIds[0] ? getCategoryById(book.categoryIds[0]) : undefined;
  const visible = showAll ? units : units.slice(0, tocLimit);
  const hiddenCount = Math.max(0, units.length - tocLimit);

  return (
    <aside
      className={cn(
        variant === 'sidebar'
          ? 'reader-sidebar hidden lg:sticky lg:top-16 lg:flex lg:max-h-[calc(100vh-4rem)] w-[300px] shrink-0 flex-col border-r border-line bg-white'
          : 'flex w-full flex-col bg-white'
      )}
    >
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <Link
          to="/library"
          className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-ink-500 transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} />
          Back to Library
        </Link>

        <div className="mb-6 flex gap-3">
          <BookCover book={book} size="sm" className="shrink-0 shadow-md" />
          <div className="min-w-0 pt-0.5">
            <h2 className="font-serif text-[15px] font-bold leading-snug text-ink-800 line-clamp-3">
              {book.title}
            </h2>
            {scholar && (
              <p className="mt-1 text-[12px] text-ink-400">{scholar.name}</p>
            )}
            {category && (
              <span className="mt-2 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {category.name}
              </span>
            )}
          </div>
        </div>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          Table of Contents
        </p>

        <nav className="space-y-0.5" aria-label="Table of contents">
          {visible.map((unit) => {
            const active = unit.index === activeIndex;
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => onSelect(unit.index)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all',
                  active
                    ? 'bg-accent/12 text-ink-800 shadow-sm ring-1 ring-accent/25'
                    : 'text-ink-600 hover:bg-cream hover:text-ink-800'
                )}
              >
                <span className={cn('text-[12px] tabular-nums font-semibold shrink-0 w-5', active ? 'text-accent' : 'text-ink-400')}>
                  {unit.displayNumber}.
                </span>
                <span className={cn('flex-1 text-[13px] leading-snug', active && 'font-semibold')}>
                  {unit.title}
                </span>
                {active ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                ) : (
                  <ChevronRight size={14} className="shrink-0 text-ink-300" />
                )}
              </button>
            );
          })}
        </nav>

        {!showAll && hiddenCount > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="mt-3 w-full rounded-lg border border-dashed border-line px-3 py-2 text-[12px] font-medium text-ink-500 transition-colors hover:border-accent/40 hover:text-accent"
          >
            View All ({units.length})
          </button>
        )}
      </div>
    </aside>
  );
}
