import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePublicBooks } from '@/hooks/usePublicBooks';

export function ContinueReadingHeroCard() {
  const { topBooks, allBooks } = usePublicBooks();
  const currentBook = topBooks[0] || allBooks[0];
  const progressPercent = 38;

  if (!currentBook) return null;

  return (
    <section className="py-4 sm:py-6 bg-white dark:bg-black transition-colors">
      <div className="container-page">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 glossy-card',
            'border border-black/[0.08] dark:border-white/10',
            'bg-neutral-50/70 dark:bg-[#141414]',
            'shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
          )}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
            {/* Left Cover + Details */}
            <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0 flex-1">
              {/* Miniature 3D Book */}
              <div
                className="relative w-[52px] h-[76px] sm:w-[68px] sm:h-[98px] rounded-lg overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.18)] border border-black/10 shrink-0"
                style={{
                  background: `linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 40%), linear-gradient(180deg, ${currentBook.color || '#1B4F72'} 0%, ${currentBook.edgeColor || '#0D2638'} 100%)`,
                }}
              >
                <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute inset-1 border border-[#D4B445]/40 rounded flex flex-col justify-between items-center p-1 text-center">
                  <span className="text-[5.5px] text-[#D4B445] font-sans uppercase tracking-wider truncate max-w-full">
                    {currentBook.categoryLabel?.toUpperCase() || 'CANON'}
                  </span>
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-arabic text-[10px] sm:text-[11px] font-bold text-white leading-none truncate max-w-full"
                  >
                    {currentBook.arabicTitle}
                  </span>
                  <span className="text-[5.5px] text-white/70 truncate max-w-full">
                    {currentBook.author.split(' ').slice(-1)[0]}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1B4F72]/10 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#1B4F72] dark:text-blue-400">
                    <Clock size={10} />
                    Continue Reading
                  </span>
                  <span className="text-xs text-neutral-400">Chapter 1</span>
                </div>

                <h3 className="font-sans text-base sm:text-lg font-bold text-ink-900 dark:text-white mt-1 truncate">
                  {currentBook.title}
                </h3>
                <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {currentBook.author}
                </p>

                {/* Progress Bar */}
                <div className="mt-2.5 flex items-center gap-2.5 max-w-xs sm:max-w-sm">
                  <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1B4F72] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs font-semibold text-ink-800 dark:text-neutral-300 shrink-0">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="w-full sm:w-auto flex items-center shrink-0">
              <Link
                to={currentBook.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] w-full sm:w-auto"
              >
                <Play size={13} className="fill-current" />
                <span>Resume Reading</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

