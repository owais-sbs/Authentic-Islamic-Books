import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PHOTOS: Record<string, string> = {
  quran:   'https://i.pinimg.com/736x/4f/c2/d2/4fc2d296e98e449b1dcc6c136bb22981.jpg',
  hadith:  'https://i.pinimg.com/236x/3f/4b/cf/3f4bcf499dba7c3d10df9dadfdba8d84.jpg',
  history: 'https://i.pinimg.com/736x/e1/79/a6/e179a613df0a2ff0d5299df24f412de4.jpg',
  sunnah:  'https://i.pinimg.com/736x/4f/c2/d2/4fc2d296e98e449b1dcc6c136bb22981.jpg',
};

export function MoreToExploreSection() {
  const cards = [
    {
      title: "The Noble Qur'an",
      tag: 'DIVINE REVELATION',
      description: 'Word-by-word meanings and verified classical scholarly exegesis.',
      categorySlug: 'quran',
    },
    {
      title: 'Prophetic Hadith',
      tag: 'AUTHENTIC TRADITIONS',
      description: 'The Sahīhain and authenticated compilations preserving prophetic guidance.',
      categorySlug: 'hadith',
    },
    {
      title: 'Islamic History',
      tag: 'EPOCHS & CHRONICLES',
      description: 'Chronicles from early prophetic eras through the golden centuries of scholarship.',
      categorySlug: 'history',
    },
    {
      title: 'Sunnah & Seerah',
      tag: 'PROPHETIC BIOGRAPHY',
      description: 'The sealed nectar and noble traits of the Messenger of Allah.',
      categorySlug: 'sunnah',
    },
  ];

  return (
    <section className="pt-2 pb-8 sm:pt-4 sm:pb-12 bg-white dark:bg-black transition-colors">
      <div className="container-page">
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

        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none no-scrollbar snap-x snap-mandatory">
            {cards.map((card) => (
              <Link
                key={card.categorySlug}
                to={`/library?category=${card.categorySlug}`}
                className={cn(
                  'group relative shrink-0 snap-start flex items-stretch overflow-hidden rounded-2xl',
                  'w-[320px] sm:w-[370px] md:w-[400px] h-[180px] sm:h-[200px]',
                  'border border-slate-200/90 dark:border-white/10',
                  'bg-white dark:bg-[#141414]',
                  'shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(27,79,114,0.14)]',
                  'transition-all duration-300 hover:-translate-y-1',
                )}
              >
                {/* Left: Text */}
                <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-center z-10 relative">
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

                {/* Right: Photo */}
                <div className="relative shrink-0 w-[150px] sm:w-[185px] h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#141414] via-white/20 dark:via-[#141414]/20 to-transparent z-10 pointer-events-none" />
                  <img
                    src={PHOTOS[card.categorySlug]}
                    alt={card.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
