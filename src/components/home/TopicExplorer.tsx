import { Link } from 'react-router-dom';
import { ArrowUpRight, BookCheck, ScrollText, Compass, Landmark } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

const FOUR_CATEGORIES = [
  {
    name: "The Noble Qur'an",
    slug: 'quran',
    arabic: 'القرآن الكريم',
    icon: BookCheck,
    description: 'Divine revelation, word-by-word meanings, classical exegesis (Tafsir), and sciences of the Qur’an.',
    color: '#1B4F72',
    stats: '8 Classical Exegeses',
  },
  {
    name: 'Prophetic Hadith',
    slug: 'hadith',
    arabic: 'الحديث النبوي',
    icon: ScrollText,
    description: 'The Sahih collections, Sunan, and rigorously verified sayings and traditions of Prophet Muhammad ﷺ.',
    color: '#1E3A5F',
    stats: '6 Canonical Compilations',
  },
  {
    name: 'Sunnah & Seerah',
    slug: 'sunnah',
    arabic: 'السنة والسيرة',
    icon: Compass,
    description: 'The blessed biography, noble character, daily habits, and exemplary sunnah of the Messenger ﷺ.',
    color: '#2C3E50',
    stats: 'Detailed Biographies',
  },
  {
    name: 'Islamic History',
    slug: 'history',
    arabic: 'التاريخ الإسلامي',
    icon: Landmark,
    description: 'Chronicles of the prophets, the Rightly Guided Caliphs, heroic companions, and Islamic civilization.',
    color: '#34495E',
    stats: 'Foundational Chronicles',
  },
];

export function TopicExplorer() {
  return (
    <section className="bg-neutral-50/50 dark:bg-black py-8 sm:py-14 transition-colors">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
            Core Disciplines
          </p>
          <h2 className="mt-1.5 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Explore the Four Pillars of Islamic Knowledge
          </h2>
          <p className="mt-2 font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Curated authentic literature organized by the classical branches of traditional scholarship.
          </p>
        </Reveal>

        {/* 4 Cards Grid with Glass Effect & Elegant Border */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {FOUR_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Reveal key={cat.slug} delay={i * 0.05}>
                <Link
                  to={`/library?category=${cat.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-neutral-900/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {/* Top Row: Clean Lucide Icon + Arabic Calligraphy */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-[#1B4F72] dark:text-blue-300 shadow-sm transition-transform group-hover:scale-105">
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-sm text-neutral-400 group-hover:text-ink-900 dark:group-hover:text-white transition-colors"
                      >
                        {cat.arabic}
                      </span>
                    </div>

                    {/* Title & Description in clean sans */}
                    <h3 className="mt-4 font-sans text-base sm:text-lg font-bold text-ink-900 dark:text-white group-hover:text-[#1B4F72] dark:group-hover:text-blue-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Bottom Stats & Arrow */}
                  <div className="mt-5 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                    <span className="font-sans text-[11px] font-medium text-neutral-400">
                      {cat.stats}
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:bg-[#1B4F72] group-hover:text-white transition-all">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
