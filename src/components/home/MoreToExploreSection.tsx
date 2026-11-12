import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QURAN_BOOKS, HADITH_BOOKS, SUNNAH_BOOKS, HISTORY_BOOKS } from '@/data/mockIslamicBooks';

export function MoreToExploreSection() {
  const cards = [
    {
      title: "The Noble Qur'an & Exegesis",
      subtitle: "Divine Revelation & Classical Tafsīr",
      description: "Ayat commentary, word-by-word meanings, and classical exegesis.",
      categorySlug: 'quran',
      accentColor: '#1B4F72',
      bgGradient: 'from-[#EEF4FA] to-[#E8F0F9]',
      darkBg: 'dark:from-[#0D1B2A] dark:to-[#111F33]',
      books: [QURAN_BOOKS[0], QURAN_BOOKS[1], QURAN_BOOKS[2]],
    },
    {
      title: 'Prophetic Hadith & Traditions',
      subtitle: "Noble Sayings & Noble Character",
      description: "The Sahīhain and authenticated collections preserving the Prophet's words ﷺ.",
      categorySlug: 'hadith',
      accentColor: '#7D4A1E',
      bgGradient: 'from-[#FDF5EC] to-[#FAF0E4]',
      darkBg: 'dark:from-[#1E1208] dark:to-[#2A1A0E]',
      books: [HADITH_BOOKS[0], SUNNAH_BOOKS[0], HADITH_BOOKS[1]],
    },
    {
      title: 'Islamic History & Caliphates',
      subtitle: "Civilizations, Scholars & Epochs",
      description: "Chronicles from early prophetic eras through the golden centuries of knowledge.",
      categorySlug: 'history',
      accentColor: '#3D5A44',
      bgGradient: 'from-[#EEF5F0] to-[#E8F3EC]',
      darkBg: 'dark:from-[#0C1A10] dark:to-[#111E14]',
      books: [HISTORY_BOOKS[0], HISTORY_BOOKS[1], HISTORY_BOOKS[2]],
    },
  ];

  return (
    <section className="py-8 sm:py-12 bg-neutral-50 dark:bg-black transition-colors">
      <div className="container-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">
            More to Explore
          </h2>
          <Link
            to="/categories"
            className="text-xs font-semibold uppercase tracking-wider text-[#1B4F72] hover:text-[#154060] dark:text-blue-400"
          >
            All Disciplines
          </Link>
        </div>

        {/* Stacked wide cards */}
        <div className="space-y-4">
          {cards.map((card) => (
            <Link
              key={card.categorySlug}
              to={`/library?category=${card.categorySlug}`}
              className={cn(
                'group relative flex flex-col sm:flex-row sm:items-center justify-between overflow-hidden rounded-2xl',
                'border border-black/[0.07] dark:border-white/8',
                'bg-gradient-to-r',
                card.bgGradient,
                card.darkBg,
                'p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]',
                'transition-all duration-300 gap-4',
              )}
            >
              {/* Left copy area */}
              <div className="min-w-0 flex-1 z-10">
                <span
                  className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] block mb-1"
                  style={{ color: card.accentColor }}
                >
                  {card.subtitle}
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-ink-900 dark:text-white leading-snug">
                  {card.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed max-w-md">
                  {card.description}
                </p>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
                  style={{ color: card.accentColor }}
                >
                  <span>Browse Category</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Right: Overlapping 3D book covers with proper spacing */}
              <div className="relative shrink-0 flex items-center justify-end h-28 sm:h-36 w-full sm:w-[220px] self-end sm:self-auto overflow-visible pr-2">
                {card.books.map((b, idx) => {
                  const edge = b.edgeColor ?? '#0A1A12';
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'relative rounded-lg overflow-hidden border border-black/15 shadow-[0_6px_16px_rgba(0,0,0,0.2)]',
                        'w-[64px] h-[92px] sm:w-[76px] sm:h-[110px] transition-transform duration-300 group-hover:-translate-y-1',
                        idx === 0 && 'z-10 -mr-5 sm:-mr-6 rotate-[-5deg]',
                        idx === 1 && 'z-20 -mr-5 sm:-mr-6 rotate-[0deg] scale-105',
                        idx === 2 && 'z-30 rotate-[5deg]',
                      )}
                      style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.14) 0%, transparent 40%), linear-gradient(170deg, ${b.color} 0%, ${edge} 100%)`,
                      }}
                    >
                      <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/50 to-transparent" />
                      <div className="absolute inset-y-0 left-[3px] w-[0.5px] bg-white/20" />
                      <div
                        className="absolute bottom-1 right-0 top-1 w-[3px]"
                        style={{
                          background:
                            'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
                        }}
                      />
                      <div className="absolute inset-1 border border-white/20 rounded flex flex-col justify-between items-center text-center p-1">
                        <span className="text-[5px] text-white/70 uppercase tracking-wider truncate w-full">
                          {b.categoryLabel}
                        </span>
                        <span
                          dir="rtl"
                          lang="ar"
                          className="font-arabic text-[10px] sm:text-[11px] font-bold text-white leading-none truncate max-w-full"
                        >
                          {b.arabicTitle}
                        </span>
                        <span className="text-[5px] text-white/80 line-clamp-1 w-full truncate">
                          {b.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
