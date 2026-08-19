import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderNavigationProps {
  prevLabel?: string | null;
  nextLabel?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  bookSlug: string;
  isLast?: boolean;
}

export function ReaderNavigation({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  bookSlug,
  isLast,
}: ReaderNavigationProps) {
  return (
    <div className="mt-16 border-t reader-border pt-8">
      <div className="flex items-center justify-between gap-4">
        {prevLabel ? (
          <button
            onClick={onPrev}
            className="group flex flex-1 flex-col items-start rounded-lg border reader-border p-4 transition-all hover:reader-accent max-w-[45%]"
          >
            <span className="flex items-center gap-1 text-xs reader-muted">
              <ArrowLeft size={14} /> Previous
            </span>
            <span className="mt-1 truncate text-sm font-medium" style={{ color: 'var(--reader-text)' }}>
              {prevLabel}
            </span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {nextLabel ? (
          <button
            onClick={onNext}
            className="group flex flex-1 flex-col items-end rounded-lg border reader-border p-4 transition-all hover:reader-accent max-w-[45%] text-right"
          >
            <span className="flex items-center gap-1 text-xs reader-muted">
              Next <ArrowRight size={14} />
            </span>
            <span className="mt-1 truncate text-sm font-medium" style={{ color: 'var(--reader-text)' }}>
              {nextLabel}
            </span>
          </button>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {isLast && (
        <div className="mt-12 text-center">
          <p className="font-serif text-lg mb-4" style={{ color: 'var(--reader-text)' }}>
            End of Book
          </p>
          <Link
            to={`/books/${bookSlug}`}
            className="inline-flex items-center gap-2 rounded-lg border reader-border px-5 py-2.5 text-sm font-medium transition-all hover:reader-accent"
            style={{ color: 'var(--reader-text)' }}
          >
            <List size={16} /> Back to Table of Contents
          </Link>
        </div>
      )}
    </div>
  );
}
