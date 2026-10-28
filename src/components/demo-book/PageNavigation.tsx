import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  demoIslamicBook,
  getDemoBookChapterForPage,
} from '@/data/demoIslamicBook';
import { cn } from '@/lib/utils';

interface PageNavigationProps {
  pageNumber: number;
  basePath: string;
}

export function PageNavigation({ pageNumber, basePath }: PageNavigationProps) {
  const navigate = useNavigate();
  const total = demoIslamicBook.totalPages;
  const chapter = getDemoBookChapterForPage(pageNumber);
  const canPrev = pageNumber > 1;
  const canNext = pageNumber < total;

  const go = (n: number) => navigate(`${basePath}/${n}`);

  return (
    <nav
      className="flex justify-center border-t border-line pt-5 sm:pt-6"
      aria-label="Chapter and page navigation"
    >
      <div
        className={cn(
          'inline-flex max-w-full items-center gap-1 rounded-xl border border-line bg-cream p-1.5 shadow-soft',
          'dark:border-white/12 dark:bg-[#141414]',
        )}
      >
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && go(pageNumber - 1)}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
            canPrev
              ? 'border-line bg-white text-ink-800 hover:border-islamic-green hover:text-islamic-green dark:border-white/15 dark:bg-black dark:text-white/85 dark:hover:border-accent dark:hover:text-accent'
              : 'cursor-not-allowed border-transparent text-ink-300 dark:text-white/20',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="relative min-w-0">
          <select
            className={cn(
              'h-10 max-w-[40vw] cursor-pointer appearance-none truncate rounded-lg border border-line bg-white py-2 pl-3 pr-8',
              'font-sans text-sm font-semibold text-ink-900 outline-none',
              'focus:border-accent dark:border-white/15 dark:bg-black dark:text-white sm:max-w-[200px]',
            )}
            value={chapter?.id ?? ''}
            onChange={(e) => {
              const ch = demoIslamicBook.chapters.find((c) => c.id === e.target.value);
              if (ch) go(ch.startPage);
            }}
            aria-label="Select chapter"
          >
            {demoIslamicBook.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Chapter {ch.number}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-accent-dark"
            aria-hidden
          />
        </div>

        <div className="hidden h-6 w-px bg-line sm:block dark:bg-white/15" aria-hidden />

        <div className="relative min-w-0">
          <select
            className={cn(
              'h-10 max-w-[34vw] cursor-pointer appearance-none truncate rounded-lg border border-line bg-white py-2 pl-3 pr-8',
              'font-sans text-sm font-semibold text-ink-900 outline-none',
              'focus:border-accent dark:border-white/15 dark:bg-black dark:text-white sm:max-w-[140px]',
            )}
            value={pageNumber}
            onChange={(e) => go(Number(e.target.value))}
            aria-label="Select page"
          >
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Page {n}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-accent-dark"
            aria-hidden
          />
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && go(pageNumber + 1)}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
            canNext
              ? 'border-line bg-islamic-green text-white hover:bg-islamic-forest'
              : 'cursor-not-allowed border-transparent text-ink-300 dark:text-white/20',
          )}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
