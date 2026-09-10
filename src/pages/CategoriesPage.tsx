import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Scale,
  ScrollText,
  Landmark,
  Heart,
  Sparkles,
  Brain,
  UserRound,
  BookMarked,
  History,
  type LucideIcon,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCategories } from '@/hooks/useCategories';
import { useLibraryFilters } from '@/hooks/useLibraryFilters';
import { usePageMeta } from '@/hooks/usePageMeta';

const HERO_IMG =
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  aqeedah: Landmark,
  hadith: ScrollText,
  tafsir: BookMarked,
  fiqh: Scale,
  seerah: BookOpen,
  history: History,
  ethics: Heart,
  spirituality: Sparkles,
  'islamic-thought': Brain,
  biography: UserRound,
};

export function CategoriesPage() {
  usePageMeta({
    title: 'Categories — Islamic Digital Library',
    description: 'Browse Islamic books by subject — fiqh, tafsir, aqidah, history, and more.',
    path: '/categories',
  });

  const { categories } = useCategories();
  const { filteredBooks: allBooks } = useLibraryFilters();

  return (
    <PageContainer>
      <PageHero
        eyebrow="Subjects"
        title="Browse by Category"
        description="From theology and jurisprudence to history and spirituality — find works by subject."
        imageUrl={HERO_IMG}
        compact
      />

      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const count = allBooks.filter((b) => b.categoryIds.includes(cat.id)).length;
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.35) }}
              >
                <Link
                  to={`/library?category=${cat.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-cream p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-xl hover:shadow-ink-900/10"
                >
                  {/* Decorative top accent */}
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent via-accent-light to-accent/30" />

                  {/* Soft glow */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Large watermark number */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-3 -right-1 font-cinzel text-7xl font-semibold leading-none text-ink-900/[0.04] transition-colors duration-300 group-hover:text-accent/15"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-accent shadow-md transition-all duration-300 group-hover:bg-accent group-hover:text-ink-900 group-hover:scale-105">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500 transition-colors group-hover:border-accent/30 group-hover:text-accent-dark">
                      {count} {count === 1 ? 'book' : 'books'}
                    </span>
                  </div>

                  <h3 className="relative mt-5 font-cinzel text-xl font-semibold tracking-wide text-ink-900">
                    {cat.name}
                  </h3>
                  <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">
                    {cat.description}
                  </p>

                  <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors group-hover:text-accent-dark">
                    Browse Books
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/5 transition-all duration-300 group-hover:bg-accent group-hover:text-ink-900">
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
