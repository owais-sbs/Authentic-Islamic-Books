import { Link } from 'react-router-dom';
import { getScholarById } from '@/data/scholars';
import { BookCover } from '@/components/book/BookCover';
import { Reveal } from '@/components/motion/Reveal';
import type { ContinueReadingEntry } from '@/hooks/useContinueReading';

interface ContinueReadingBarProps {
  entry: ContinueReadingEntry | null;
}

/** Compact progress card — shown when a reader left a book mid-way. */
export function ContinueReadingBar({ entry }: ContinueReadingBarProps) {
  if (!entry) return null;

  const { book, percent, readHref, authorLabel, langCode } = entry;
  const scholar = getScholarById(book.authorId);
  const byline = scholar?.name ?? authorLabel;

  return (
    <section className="bg-ivory py-8 dark:bg-black sm:py-10">
      <div className="container-page">
        <Reveal>
          <div className="mb-4 text-center sm:mb-5 sm:text-left">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-dark dark:text-accent">
              Pick Up Where You Left Off
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-islamic-green dark:text-white sm:text-3xl">
              Continue Your Reading
            </h2>
          </div>

          <Link
            to={readHref}
            className="group flex items-stretch gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-book dark:border-white/10 dark:bg-[#141414] sm:gap-4 sm:p-4"
          >
            <BookCover
              book={book}
              size="sm"
              className="!h-[4.75rem] !w-[3.4rem] shrink-0 sm:!h-[5.5rem] sm:!w-16"
            />

            <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-serif text-[15px] font-semibold leading-snug text-islamic-green transition-colors group-hover:text-accent-dark dark:text-white dark:group-hover:text-accent sm:text-lg">
                  <span className="line-clamp-2">{book.title}</span>
                </h3>
                <span className="shrink-0 pt-0.5 font-sans text-sm font-bold tabular-nums text-islamic-green dark:text-white sm:text-base">
                  {percent}%
                </span>
              </div>

              <div className="mt-1.5 flex min-w-0 items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-line text-[9px] font-bold uppercase text-ink-600 dark:bg-white/10 dark:text-white/70">
                  {langCode}
                </span>
                <span className="truncate font-sans text-xs text-ink-500 dark:text-white/55 sm:text-[13px]">
                  {byline}
                </span>
              </div>

              <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-line dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#8B6B4A] transition-[width] dark:bg-accent"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
