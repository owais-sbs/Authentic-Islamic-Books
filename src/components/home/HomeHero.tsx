import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight, BookOpen, BookCheck, ScrollText, Compass, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOP_FREE_BOOKS } from '@/data/mockIslamicBooks';

export function HomeHero() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/library?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Four categories specified by user with clean professional Lucide icons (no emoji)
  const coreCategories = [
    { name: "The Noble Qur'an", slug: 'quran', Icon: BookCheck },
    { name: 'Prophetic Hadith', slug: 'hadith', Icon: ScrollText },
    { name: 'Sunnah & Seerah', slug: 'sunnah', Icon: Compass },
    { name: 'Islamic History', slug: 'history', Icon: Landmark },
  ];

  const highlightedBook = TOP_FREE_BOOKS[0]; // Ar-Raheeq Al-Makhtum

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black pt-6 pb-8 sm:pt-12 sm:pb-16 transition-colors">
      {/* Ambient Premium Radial Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-50/60 via-blue-50/20 to-transparent dark:from-emerald-950/20 dark:via-neutral-900/10 dark:to-transparent rounded-full blur-3xl opacity-75" />

      <div className="container-page relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left space-y-5"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/12 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-sans text-xs font-semibold tracking-wide text-ink-800 dark:text-neutral-200">
                Authentic Digital Islamic Library
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-ink-900 dark:text-white leading-[1.12] tracking-tight">
              Where Authentic Islamic Learning Begins
            </h1>

            {/* Subtitle */}
            <p className="mx-auto lg:mx-0 max-w-xl font-sans text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Explore timeless verified works across the Noble Qur’an, Prophetic Hadith, Sunnah, and
              Islamic History — designed for a pristine, distraction-free reading experience.
            </p>

            {/* Search Bar - Responsive, professional on mobile & desktop */}
            <form
              onSubmit={handleSearch}
              className={cn(
                'relative max-w-xl mx-auto lg:mx-0 rounded-2xl',
                'border border-black/[0.1] dark:border-white/15',
                'bg-white/95 dark:bg-neutral-900/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl',
                'p-1.5 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-[#1B4F72]/50',
              )}
            >
              <div className="pl-3 text-neutral-400 shrink-0">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search books, authors, Hadith, Tafsir..."
                className="w-full min-w-0 bg-transparent py-2.5 text-xs sm:text-sm font-sans text-ink-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#1B4F72] hover:bg-[#154060] text-white px-4 sm:px-5 py-2.5 text-xs font-semibold tracking-wide shadow-sm transition-all shrink-0 active:scale-95"
              >
                Search
              </button>
            </form>

            {/* Four Core Categories (Qur'an, Hadith, Sunnah, History) - With professional icons */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {coreCategories.map((cat) => {
                  const Icon = cat.Icon;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/library?category=${cat.slug}`}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold',
                        'border border-black/[0.08] dark:border-white/10',
                        'bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'text-ink-800 dark:text-neutral-200 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#1B4F72]/40',
                      )}
                    >
                      <Icon size={14} className="text-[#1B4F72] dark:text-blue-400" />
                      <span>{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Highlighted 3D Book Presentation (Desktop & Tablet) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div
              className={cn(
                'relative w-full max-w-sm rounded-3xl p-6 sm:p-8',
                'border border-black/[0.08] dark:border-white/12',
                'bg-gradient-to-br from-white/80 via-white/50 to-neutral-50/70 dark:from-neutral-900/80 dark:via-neutral-900/50 dark:to-neutral-950/70',
                'backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]',
              )}
            >
              {/* Highlight ribbon */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles size={11} />
                  Book of the Week
                </span>
                <span className="text-xs font-sans text-neutral-400">584 pages</span>
              </div>

              {/* Center 3D Book */}
              <div className="flex justify-center my-4">
                <div
                  className="relative w-[150px] h-[225px] sm:w-[170px] sm:h-[255px] rounded-xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.24)] border border-black/10 transition-transform hover:-translate-y-2 duration-300"
                  style={{
                    background: `linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 40%), linear-gradient(180deg, #1B4F72 0%, #0D2638 100%)`,
                  }}
                >
                  <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
                  <div className="absolute inset-y-0 left-[7px] w-[1px] bg-white/20" />
                  <div
                    className="absolute bottom-1.5 right-0 top-1.5 w-[5px] rounded-r-sm"
                    style={{
                      background:
                        'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
                    }}
                  />
                  <div className="absolute inset-[10px] border border-[#D4B445]/40 rounded-lg flex flex-col justify-between items-center text-center p-3 text-[#F9F5EC]">
                    <span className="text-[7px] uppercase tracking-widest text-[#D4B445] font-semibold">
                      Authentic Seerah
                    </span>
                    <div className="my-auto">
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-xl font-bold text-[#FFF8E7] leading-tight"
                      >
                        الرحيق المختوم
                      </p>
                      <h4 className="mt-2 font-serif text-xs font-semibold leading-tight text-white/95">
                        Ar-Raheeq Al-Makhtum
                      </h4>
                    </div>
                    <span className="text-[7.5px] uppercase tracking-wider text-[#D4B445]/90">
                      al-Mubarakpuri
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center mt-3">
                <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-white">
                  {highlightedBook.title}
                </h3>
                <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {highlightedBook.description}
                </p>
              </div>

              <div className="mt-5">
                <Link
                  to={highlightedBook.href}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 py-3 text-xs font-semibold shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <BookOpen size={14} />
                  <span>Start Reading Now</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
