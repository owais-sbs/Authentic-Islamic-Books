import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookCheck, ScrollText, Compass, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomeHero() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/library?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Four categories specified by user with clean professional Lucide icons
  const coreCategories = [
    { name: "The Noble Qur'an", slug: 'quran', Icon: BookCheck },
    { name: 'Prophetic Hadith', slug: 'hadith', Icon: ScrollText },
    { name: 'Sunnah & Seerah', slug: 'sunnah', Icon: Compass },
    { name: 'Islamic History', slug: 'history', Icon: Landmark },
  ];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black pt-10 pb-12 sm:pt-16 sm:pb-20 transition-colors">
      {/* Background Image: herobg.png with elegant overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/herobg.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-70 dark:opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/50 to-white/90 dark:from-black/75 dark:via-black/65 dark:to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 dark:from-black/60 dark:via-transparent dark:to-black/60" />
      </div>

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center space-y-5"
        >
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/12 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#1B4F72] animate-pulse" />
            <span className="font-sans text-xs font-semibold tracking-wide text-[#64748B] dark:text-neutral-300">
              Verified Islamic Library
            </span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-sans text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-ink-900 dark:text-white leading-[1.14] tracking-tight">
            Timeless Islamic Wisdom, Digitally Preserved
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl font-sans text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-neutral-300 leading-relaxed">
            Access authenticated classical works across the Noble Qur’an, Prophetic Hadith, Sunnah, and
            Islamic History in a pristine reading environment.
          </p>

          {/* Search Bar - Responsive, professional */}
          <form
            onSubmit={handleSearch}
            className={cn(
              'relative max-w-xl mx-auto rounded-2xl',
              'border border-black/[0.1] dark:border-white/15',
              'bg-white/95 dark:bg-neutral-900/95 shadow-[0_8px_30px_rgba(27,79,114,0.08)] backdrop-blur-xl',
              'p-1.5 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-[#1B4F72]/50 glossy-card',
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
              className="rounded-xl bg-[#1B4F72] hover:bg-[#154060] text-white px-5 sm:px-6 py-2.5 text-xs font-semibold tracking-wide shadow-sm transition-all shrink-0 active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Four Core Categories (Qur'an, Hadith, Sunnah, History) - With professional icons */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {coreCategories.map((cat) => {
                const Icon = cat.Icon;
                return (
                  <Link
                    key={cat.slug}
                    to={`/library?category=${cat.slug}`}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold',
                      'border border-slate-200 dark:border-white/10',
                      'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800',
                      'text-ink-900 dark:text-neutral-200 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1B4F72] glossy-card',
                    )}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-neutral-800 text-[#1B4F72] dark:text-blue-400">
                      <Icon size={14} strokeWidth={2} />
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
