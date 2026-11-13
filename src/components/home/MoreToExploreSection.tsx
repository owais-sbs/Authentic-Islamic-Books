import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePublicBooks } from '@/hooks/usePublicBooks';

export function MoreToExploreSection() {
  const { quranBooks, hadithBooks, sunnahBooks, historyBooks, allBooks } = usePublicBooks();

  const getPair = (list: typeof allBooks) => {
    const src = list.length > 0 ? list : allBooks;
    const primary = src[0] || allBooks[0];
    const secondary = src[1] || src[0] || allBooks[0];
    return { primary, secondary };
  };

  const quranPair = getPair(quranBooks);
  const hadithPair = getPair(hadithBooks);
  const historyPair = getPair(historyBooks);
  const sunnahPair = getPair(sunnahBooks);

  const cards = [
    {
      title: "The Noble Qur'an",
      tag: 'DIVINE REVELATION',
      subtitle: 'Exegesis & Classical Tafsīr',
      description: 'Word-by-word meanings and verified classical scholarly exegesis.',
      categorySlug: 'quran',
      primaryBook: quranPair.primary,
      secondaryBook: quranPair.secondary,
    },
    {
      title: 'Prophetic Hadith',
      tag: 'AUTHENTIC TRADITIONS',
      subtitle: 'Sayings & Noble Guidance',
      description: 'The Sahīhain and authenticated compilations preserving prophetic guidance.',
      categorySlug: 'hadith',
      primaryBook: hadithPair.primary,
      secondaryBook: hadithPair.secondary,
    },
    {
      title: 'Islamic History',
      tag: 'EPOCHS & CHRONICLES',
      subtitle: 'Civilizations & Caliphates',
      description: 'Chronicles from early prophetic eras through the golden centuries of scholarship.',
      categorySlug: 'history',
      primaryBook: historyPair.primary,
      secondaryBook: historyPair.secondary,
    },
    {
      title: 'Sunnah & Seerah',
      tag: 'PROPHETIC BIOGRAPHY',
      subtitle: 'Life & Character',
      description: 'The sealed nectar and noble traits of the Messenger of Allah.',
      categorySlug: 'sunnah',
      primaryBook: sunnahPair.primary,
      secondaryBook: sunnahPair.secondary,
    },
  ];

  return (
    <section className="pt-2 pb-8 sm:pt-4 sm:pb-12 bg-white dark:bg-black transition-colors">
      <div className="container-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
              Curated Shelves
            </p>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight mt-0.5">
              More to Explore
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold uppercase tracking-wider text-[#1B4F72] hover:text-[#154060] dark:text-blue-400 transition-colors"
          >
            All Disciplines
          </Link>
        </div>

        {/* Horizontal Scrollable Carousel (Exact Apple Books Card layout) */}
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none scrollbar-hide no-scrollbar snap-x snap-mandatory">
            {cards.map((card) => {
              const pBook = card.primaryBook;
              const sBook = card.secondaryBook;
              const pEdge = pBook.edgeColor ?? '#0A1A12';
              const sEdge = sBook.edgeColor ?? '#0A1A12';

              return (
                <Link
                  key={card.categorySlug}
                  to={`/library?category=${card.categorySlug}`}
                  className={cn(
                    'group relative shrink-0 snap-start flex items-stretch overflow-hidden rounded-2xl glossy-card',
                    'w-[320px] sm:w-[370px] md:w-[400px] h-[175px] sm:h-[195px]',
                    'border border-slate-200/90 dark:border-white/10',
                    'bg-white dark:bg-[#141414]',
                    'shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(27,79,114,0.14)]',
                    'transition-all duration-300 hover:-translate-y-1',
                  )}
                >
                  {/* Left: Text Information */}
                  <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-center z-10">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#1B4F72] dark:text-blue-400 mb-1">
                      {card.tag}
                    </span>
                    <h3 className="font-sans text-lg sm:text-xl font-bold text-ink-900 dark:text-white leading-tight">
                      {card.title}
                    </h3>
                    <p className="font-sans text-xs text-[#64748B] dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4F72] dark:text-blue-400">
                      <span>Browse Collection</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Right: Two Large Overlapping 3D Books with glossy specular border */}
                  <div className="relative shrink-0 w-[145px] sm:w-[170px] h-full flex items-end justify-end overflow-hidden pr-3 sm:pr-4 pb-0">
                    {/* Secondary Book (Tilted slightly behind) */}
                    <div
                      className={cn(
                        'absolute bottom-0 right-10 sm:right-12 rounded-t-lg overflow-hidden border border-black/15 glossy-book',
                        'w-[76px] sm:w-[90px] h-[140px] sm:h-[160px] shadow-lg',
                        'transition-transform duration-300 group-hover:-translate-y-1',
                        'rotate-[-3deg] z-10',
                      )}
                      style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 40%), linear-gradient(170deg, ${sBook.color} 0%, ${sEdge} 100%)`,
                      }}
                    >
                      <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/55 to-transparent" />
                      <div className="absolute inset-y-0 left-[3.5px] w-[0.5px] bg-white/20" />
                      <div
                        className="absolute bottom-0 right-0 top-1 w-[4px]"
                        style={{
                          background:
                            'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
                        }}
                      />
                      <div className="absolute inset-1.5 border border-white/20 rounded flex flex-col justify-between items-center text-center p-1 text-white">
                        <span className="text-[5.5px] uppercase tracking-wider opacity-75 font-semibold">{sBook.categoryLabel}</span>
                        <div className="my-auto">
                          <p dir="rtl" lang="ar" className="font-arabic text-[11px] font-bold leading-tight">
                            {sBook.arabicTitle}
                          </p>
                          <span className="text-[6px] opacity-85 truncate block mt-0.5">{sBook.title}</span>
                        </div>
                        <span className="text-[5.5px] opacity-75">{sBook.author.split(' ').slice(-1)[0]}</span>
                      </div>
                    </div>

                    {/* Primary Book (Prominent in front) */}
                    <div
                      className={cn(
                        'relative bottom-0 rounded-t-lg overflow-hidden border border-black/20 glossy-book',
                        'w-[82px] sm:w-[98px] h-[155px] sm:h-[178px] shadow-2xl',
                        'transition-transform duration-300 group-hover:-translate-y-2',
                        'rotate-[3deg] z-20',
                      )}
                      style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 40%), linear-gradient(170deg, ${pBook.color} 0%, ${pEdge} 100%)`,
                      }}
                    >
                      <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/60 to-transparent" />
                      <div className="absolute inset-y-0 left-[4px] w-[0.5px] bg-white/25" />
                      <div
                        className="absolute bottom-0 right-0 top-1 w-[4px]"
                        style={{
                          background:
                            'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
                        }}
                      />
                      <div className="absolute inset-2 border border-white/25 rounded flex flex-col justify-between items-center text-center p-1.5 text-white">
                        <span className="text-[6.5px] uppercase tracking-wider opacity-90 font-semibold text-blue-100">
                          {pBook.categoryLabel}
                        </span>
                        <div className="my-auto">
                          <p dir="rtl" lang="ar" className="font-arabic text-[13px] sm:text-[14px] font-bold leading-tight">
                            {pBook.arabicTitle}
                          </p>
                          <p className="font-sans text-[7.5px] font-semibold opacity-95 mt-1 line-clamp-2 leading-tight">
                            {pBook.title}
                          </p>
                        </div>
                        <span className="text-[6.5px] opacity-80 text-blue-100">{pBook.author.split(' ').slice(-1)[0]}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
