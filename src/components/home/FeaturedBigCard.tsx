import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePublicBooks } from '@/hooks/usePublicBooks';

export function FeaturedBigCard() {
  const { topBooks, allBooks } = usePublicBooks();
  const pool = topBooks.length > 0 ? topBooks : allBooks;
  const books = pool.slice(0, 3);

  return (
    <section className="py-6 sm:py-10 bg-white dark:bg-black transition-colors">
      <div className="container-page">
        {/* Section label */}
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
              Featured Collection
            </p>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight mt-0.5">
              Classical Foundations of Knowledge
            </h2>
          </div>
          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/15 bg-white/60 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-ink-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <span>Sections</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Big Showcase Card */}
        <div
          className={cn(
            'relative overflow-hidden rounded-3xl glossy-card',
            'border border-white/20 dark:border-white/10',
            'shadow-[0_16px_45px_rgba(13,33,55,0.25)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.45)]',
          )}
          style={{
            background: 'linear-gradient(135deg, #0D2137 0%, #163654 60%, #102A44 100%)',
          }}
        >
          {/* Subtle glossy sheen highlight */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12]" />
          <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-64 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-1/4 w-64 h-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[300px]">
            {/* Left Copy */}
            <div className="flex-1 w-full flex flex-col justify-center space-y-4 p-7 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-white/10 border border-white/20 px-3 py-1 font-sans text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Sparkles size={12} className="text-blue-300" />
                Curated Classical Canon
              </span>

              <h3 className="font-sans text-2xl sm:text-3xl lg:text-[2.3rem] font-bold text-white leading-[1.2] tracking-tight">
                Centuries of Scholarly Rigor<br className="hidden sm:block" /> at Your Fingertips
              </h3>

              <p className="font-sans text-sm sm:text-base text-blue-100/75 leading-relaxed max-w-md">
                Step into verified works of exegesis, primary prophetic hadith, and biographical
                chronicles — preserved with chains of transmission and rendered for effortless modern reading.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#0D2137] px-5 py-2.5 text-sm font-bold shadow-lg hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookMarked size={15} />
                  <span>Explore Collection</span>
                </Link>

                <Link
                  to="/categories"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  View Disciplines
                </Link>
              </div>
            </div>

            {/* Right: Clean 3D Books Showcase without middle divider line */}
            <div className="relative shrink-0 flex items-end justify-center px-6 sm:px-12 pt-4 pb-0 w-full lg:w-auto overflow-visible">
              <div className="flex items-end justify-center -space-x-3 sm:-space-x-4 pb-0">
                {books.map((b, idx) => {
                  const edge = b.edgeColor ?? '#06221A';
                  const isCenter = idx === 1;
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'relative rounded-t-xl overflow-hidden border border-white/25 glossy-book transition-all duration-300',
                        isCenter
                          ? 'w-[118px] sm:w-[142px] h-[190px] sm:h-[230px] z-20 shadow-[0_-16px_40px_rgba(0,0,0,0.6)] scale-105'
                          : 'w-[98px] sm:w-[118px] h-[160px] sm:h-[195px] z-10 shadow-[0_-10px_28px_rgba(0,0,0,0.4)] opacity-90',
                        idx === 0 && 'rotate-[-4deg] origin-bottom',
                        idx === 2 && 'rotate-[4deg] origin-bottom',
                      )}
                      style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 40%), linear-gradient(170deg, ${b.color} 0%, ${edge} 100%)`,
                      }}
                    >
                      {/* Spine */}
                      <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/55 to-transparent" />
                      <div className="absolute inset-y-0 left-[5px] w-[0.5px] bg-white/25" />
                      {/* Pages edge */}
                      <div
                        className="absolute top-1 bottom-0 right-0 w-[5px]"
                        style={{
                          background:
                            'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
                        }}
                      />
                      {/* Inside details */}
                      <div className="absolute inset-[8px] border border-white/20 rounded-lg flex flex-col justify-between items-center text-center p-2 text-white">
                        <span className="text-[7px] text-white/70 uppercase tracking-widest">{b.categoryLabel}</span>
                        <div className="my-auto">
                          <p dir="rtl" lang="ar" className="font-arabic text-sm sm:text-base font-bold text-white leading-tight">
                            {b.arabicTitle}
                          </p>
                          <p className="font-sans text-[9px] text-white/90 font-medium mt-1 leading-tight line-clamp-2">
                            {b.title}
                          </p>
                        </div>
                        <span className="text-[7px] text-blue-200">{b.author.split(' ').slice(-1)[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
