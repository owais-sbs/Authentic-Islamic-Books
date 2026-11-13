import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppBookCover } from '@/components/book/AppBookCover';
import { usePublicBooks } from '@/hooks/usePublicBooks';
import { LibraryCatalog } from '@/components/library-demo';
import { cn } from '@/lib/utils';

export function LibraryPage() {
  usePageMeta({
    title: 'Browse Library — Authentic Islamic Books',
    description:
      'Search and browse verified Islamic books across The Noble Qur’an, Prophetic Hadith, Sunnah & Seerah, and Islamic History.',
    path: '/library',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const { allBooks, quranBooks, hadithBooks, sunnahBooks, historyBooks, hasRealBooks } = usePublicBooks();

  const categories = [
    { label: 'All Works', slug: 'all' },
    { label: "The Noble Qur'an", slug: 'quran' },
    { label: 'Prophetic Hadith', slug: 'hadith' },
    { label: 'Sunnah & Seerah', slug: 'sunnah' },
    { label: 'Islamic History', slug: 'history' },
  ];

  const filteredBooks = useMemo(() => {
    let list = allBooks;

    if (activeCategory === 'quran') list = quranBooks;
    else if (activeCategory === 'hadith') list = hadithBooks;
    else if (activeCategory === 'sunnah') list = sunnahBooks;
    else if (activeCategory === 'history') list = historyBooks;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.arabicTitle && b.arabicTitle.toLowerCase().includes(q)) ||
          b.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, searchTerm, allBooks, quranBooks, hadithBooks, sunnahBooks, historyBooks]);

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') params.delete('category');
    else params.set('category', slug);
    setSearchParams(params);
  };

  return (
    <PageContainer>
      {/* Editorial Header (Apple Books Style) */}
      <div className="bg-neutral-50/70 dark:bg-black/60 border-b border-black/[0.06] dark:border-white/10 py-8 sm:py-12 transition-colors">
        <div className="container-page">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Library' }]} />

          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-accent-dark dark:text-accent">
                Complete Catalog
              </p>
              <h1 className="mt-1 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink-900 dark:text-white">
                Islamic Digital Library
              </h1>
              <p className="mt-2 max-w-xl font-sans text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Explore authentic collections with verified chains, classical commentaries, and
                translations presented in high-fidelity book formats.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="w-full md:w-80 relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search titles, scholars..."
                className="w-full rounded-2xl border border-black/[0.08] dark:border-white/12 bg-white dark:bg-neutral-900 py-3 pl-10 pr-4 text-sm font-sans text-ink-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F72] shadow-sm"
              />
            </div>
          </div>

          {/* 4 Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition-all',
                    active
                      ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 shadow-sm'
                      : 'border border-black/[0.08] dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Books Grid (Apple Books 3D Layout) */}
      <div className="container-page py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-white">
            {activeCategory === 'all'
              ? 'All Scholarly Works'
              : categories.find((c) => c.slug === activeCategory)?.label}
          </h2>
          <span className="font-sans text-xs text-neutral-500">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
          </span>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {filteredBooks.map((book) => (
              <div key={book.id} className="flex justify-center">
                <AppBookCover book={book} size="shelf" showDetails={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <BookOpen size={36} className="mx-auto text-neutral-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-white">
              No books found
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search query or select another discipline.
            </p>
          </div>
        )}

        {/* Demo Format Layouts Section (only when no real admin books uploaded yet) */}
        {!hasRealBooks && (
          <div className="mt-20 pt-12 border-t border-black/[0.06] dark:border-white/10">
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4F72] dark:text-blue-400">
                Reading Layouts
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white mt-1">
                Scholarly Presentation Formats
              </h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                Preview dedicated layouts engineered specifically for Quranic tafsir, hadith matn & sanad,
                biographies, refutations, and quiet reading.
              </p>
            </div>

            <LibraryCatalog />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
