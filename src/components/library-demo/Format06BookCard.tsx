import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getScholarById } from '@/data/scholars';
import {
  FORMAT_06_COVER_GRADIENT,
  FORMAT_06_FEATURES,
  FORMAT_06_LABEL,
  FORMAT_06_NAME,
} from '@/lib/readingFormat';
import type { Book } from '@/types';

interface Format06BookCardProps {
  book: Book;
}

/** Library card matching Format 06 demo card style — for real uploaded books. */
export function Format06BookCard({ book }: Format06BookCardProps) {
  const scholar = getScholarById(book.authorId);
  const author = scholar?.name ?? book.authorId;

  return (
    <Link
      to={`/books/${book.slug}/read`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-cream shadow-[0_2px_12px_rgba(11,25,41,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_12px_28px_rgba(11,25,41,0.08)]"
    >
      <div className="relative aspect-[5/3.6] w-full shrink-0 overflow-hidden border-b border-line bg-[#F3EFE6]">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div
            className="relative aspect-[3/4] w-[42%] max-w-[140px] overflow-hidden rounded-sm border border-black/10 shadow-lg"
            style={
              book.coverUrl
                ? undefined
                : { background: FORMAT_06_COVER_GRADIENT }
            }
          >
            {book.coverUrl ? (
              <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.12em] text-accent-light">
                  Islamic Digital Library
                </p>
                <div className="my-2 h-px w-8 bg-accent/50" />
                <p className="font-cinzel text-[11px] leading-snug text-white/90 line-clamp-4">
                  {book.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
        <p className="font-sans text-[10px] font-semibold tracking-[0.14em] text-ink-400 sm:text-[11px]">
          {FORMAT_06_LABEL}
        </p>
        <h3 className="mt-2 font-serif text-base font-semibold leading-snug text-ink-900 sm:text-lg line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-1.5 font-sans text-[12px] text-ink-500 sm:text-[13px]">{author}</p>
        <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-accent-dark sm:text-[11px]">
          {FORMAT_06_NAME}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 font-serif text-[13px] leading-relaxed text-ink-600 sm:mt-4 sm:text-[14px]">
          {book.description || book.subtitle || 'Complete Scholarly Edition.'}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
          {FORMAT_06_FEATURES.map((f) => (
            <span
              key={f}
              className="rounded-md border border-line bg-parchment px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide text-ink-600"
            >
              {f}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent-dark transition-colors group-hover:text-ink-900 sm:mt-6">
          Open this format
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
