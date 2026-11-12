import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QURAN_BOOKS, HADITH_BOOKS, SUNNAH_BOOKS } from '@/data/mockIslamicBooks';

export function FeaturedBigCard() {
  const books = [QURAN_BOOKS[0], HADITH_BOOKS[0], SUNNAH_BOOKS[0]];

  return (
    <section className="py-6 sm:py-10 bg-white dark:bg-black transition-colors">
      <div className="container-page">
        {/* Section label */}
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
              Featured Collection
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight mt-0.5">
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
            'relative overflow-hidden rounded-3xl',
            'border border-black/[0.07] dark:border-white/10',
            'shadow-[0_12px_40px_rgba(0,0,0,0.07)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
          )}
          style={{
            background: 'linear-gradient(135deg, #0D2137 0%, #1B3D5C 50%, #0E2744 100%)',
          }}
        >
          {/* Ambient top glow */}
          <div className="pointer-events-none absolute -top-20 left-1/4 w-96 h-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-1/4 w-64 h-48 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch min-h-[280px] sm:min-h-[320px]">
            {/* Left Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4 p-7 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-white/10 border border-white/20 px-3 py-1 font-sans text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Sparkles size={12} className="text-amber-400" />
                Curated Classical Canon
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2.4rem] font-bold text-white leading-[1.2]">
                Centuries of Scholarly Rigor<br className="hidden sm:block" /> at Your Fingertips
              </h3>

              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed max-w-md">
                Step into verified works of exegesis, primary prophetic hadith, and biographical
                chronicles — preserved with chains of transmission and rendered for effortless modern reading.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
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

              {/* Stats row */}
              <div className="flex items-center gap-6 pt-2">
                {[
                  { label: 'Books', value: '500+' },
                  { label: 'Scholars', value: '120+' },
                  { label: 'Languages', value: '8' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-xl font-bold text-white">{s.value}</p>
                    <p className="font-sans text-[11px] text-white/50 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Large Book Display */}
            <div className="lg:col-span-5 relative flex items-end justify-center overflow-hidden min-h-[180px] lg:min-h-0">
              {/* Gradient fade at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0D2137]/80 to-transparent z-10" />
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#0D2137]/30 to-transparent" />

              {/* Three 3D books, displayed large */}
              <div className="relative flex items-end justify-center gap-0 pb-0 mb-0 w-full h-full">
                {books.map((b, idx) => {
                  const edge = b.edgeColor ?? '#06221A';
                  const isCenter = idx === 1;
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'relative rounded-t-xl overflow-hidden border border-black/20',
                        'transition-all duration-500',
                        isCenter
                          ? 'w-[110px] sm:w-[130px] h-[180px] sm:h-[220px] z-20 shadow-[0_-12px_40px_rgba(0,0,0,0.5)]'
                          : 'w-[90px] sm:w-[110px] h-[150px] sm:h-[185px] z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]',
                        idx === 0 && 'translate-x-6 rotate-[-4deg] origin-bottom',
                        idx === 2 && '-translate-x-6 rotate-[4deg] origin-bottom',
                      )}
                      style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.14) 0%, transparent 40%), linear-gradient(170deg, ${b.color} 0%, ${edge} 100%)`,
                      }}
                    >
                      {/* Spine */}
                      <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/50 to-transparent" />
                      <div className="absolute inset-y-0 left-[5px] w-[0.5px] bg-white/15" />
                      {/* Page edges */}
                      <div
                        className="absolute top-1 bottom-0 right-0 w-[5px]"
                        style={{ background: 'repeating-linear-gradient(to right,#F5EEE1 0px,#F5EEE1 1px,#DACDB7 1px,#DACDB7 2px)' }}
                      />
                      {/* Inner frame */}
                      <div className="absolute inset-[8px] border border-white/20 rounded-lg flex flex-col justify-between items-center text-center p-2">
                        <span className="text-[7px] text-white/70 uppercase tracking-widest">{b.categoryLabel}</span>
                        <div className="my-auto">
                          <p dir="rtl" lang="ar" className="font-arabic text-sm sm:text-base font-bold text-white/95 leading-tight">
                            {b.arabicTitle}
                          </p>
                          <p className="font-serif text-[9px] text-white/80 mt-1 leading-tight line-clamp-2">{b.title}</p>
                        </div>
                        <span className="text-[7px] text-amber-300/80">{b.author.split(' ').slice(-1)[0]}</span>
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
