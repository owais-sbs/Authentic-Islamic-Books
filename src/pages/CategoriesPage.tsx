import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { PRIMARY_FOUR_CATEGORIES } from '@/data/categories';
import {
  QURAN_BOOKS,
  HADITH_BOOKS,
  SUNNAH_BOOKS,
  HISTORY_BOOKS,
} from '@/data/mockIslamicBooks';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppBookCover } from '@/components/book/AppBookCover';
import { cn } from '@/lib/utils';

const CATEGORY_MAP = {
  quran: {
    arabic: 'القرآن الكريم',
    color: '#1B4F72',
    books: QURAN_BOOKS,
  },
  hadith: {
    arabic: 'الحديث النبوي',
    color: '#1E3A5F',
    books: HADITH_BOOKS,
  },
  sunnah: {
    arabic: 'السنة والسيرة',
    color: '#2C3E50',
    books: SUNNAH_BOOKS,
  },
  history: {
    arabic: 'التاريخ الإسلامي',
    color: '#34495E',
    books: HISTORY_BOOKS,
  },
};

export function CategoriesPage() {
  usePageMeta({
    title: 'Disciplines & Categories — Islamic Digital Library',
    description:
      'Explore authentic works across the four core disciplines: The Noble Qur’an, Prophetic Hadith, Sunnah & Seerah, and Islamic History.',
    path: '/categories',
  });

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="bg-neutral-50/60 dark:bg-black/60 border-b border-black/[0.05] dark:border-white/10 py-7 sm:py-10 transition-colors">
        <div className="container-page">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Disciplines' }]} />

          <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
                Classical Canon
              </p>
              <h1 className="mt-1 font-sans text-2xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
                The Four Primary Disciplines
              </h1>
              <p className="mt-1.5 max-w-2xl font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Organized strictly according to classical Islamic scholarship. Delve into verified
                literature across Qur’an, Hadith, Sunnah, and History.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Disciplines Sections */}
      <div className="container-page py-8 sm:py-12 space-y-8 sm:space-y-12">
        {PRIMARY_FOUR_CATEGORIES.map((cat, idx) => {
          const meta = CATEGORY_MAP[cat.slug as keyof typeof CATEGORY_MAP] || CATEGORY_MAP.quran;
          const Icon = getCategoryIcon(cat.slug);

          return (
            <motion.section
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={cn(
                'rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.08] dark:border-white/10',
                'bg-white dark:bg-[#151515]',
                'shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
              )}
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-black/[0.06] dark:border-white/[0.08] gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-[#1B4F72] dark:text-blue-300 shadow-sm">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
                        {cat.name}
                      </h2>
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-sm sm:text-base text-neutral-400 font-semibold"
                      >
                        {meta.arabic}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/library?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 px-3.5 py-2 text-xs font-semibold text-ink-900 dark:text-white transition-colors self-start sm:self-auto shrink-0"
                >
                  <span>Browse All</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Sample Books from this category */}
              <div className="pt-5">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400 mb-3.5">
                  Highlighted Works
                </p>
                <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
                  {meta.books.map((book) => (
                    <div key={book.id} className="snap-start shrink-0">
                      <AppBookCover book={book} size="shelf" showDetails={true} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </PageContainer>
  );
}
