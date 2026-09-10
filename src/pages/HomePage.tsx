import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Type,
  Compass,
  Globe,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ArrowRight,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { BookGrid } from '@/components/library/BookGrid';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { Drawer } from '@/components/ui/Drawer';
import { useLibraryFilters, type SortOption } from '@/hooks/useLibraryFilters';
import { useScholars } from '@/hooks/useScholars';
import { useCategories } from '@/hooks/useCategories';
import { usePageMeta } from '@/hooks/usePageMeta';
import { hijriPeriods } from '@/data/periods';
import heroImg from '@/assets/home.jpeg';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

export function HomePage() {
  usePageMeta({
    title: 'Islamic Digital Library — Explore Centuries of Scholarship',
    description:
      'Discover a growing collection of Islamic books and scholarly works, presented in a clean, structured English reading experience.',
    path: '/',
  });

  const {
    filters,
    filteredBooks,
    totalBooks,
    togglePeriod,
    toggleCategory,
    toggleScholar,
    setQuery,
    setSort,
    clearAll,
    hasActiveFilters,
  } = useLibraryFilters();

  const { scholars } = useScholars();
  const { categories } = useCategories();

  const [libView, setLibView] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [heroQuery, setHeroQuery] = useState('');
  const libraryRef = useRef<HTMLElement>(null);

  const stats = [
    { icon: BookOpen, value: `${Math.max(totalBooks, 0)}+`, label: 'Books' },
    { icon: Users, value: `${scholars.length}+`, label: 'Scholars' },
    { icon: Clock, value: String(hijriPeriods.length), label: 'Centuries' },
    { icon: Compass, value: `${categories.length}+`, label: 'Subjects' },
    { icon: Globe, value: 'English', label: 'Only' },
  ];

  function submitHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroQuery.trim();
    setQuery(q);
    libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <PageContainer>
      <div>
        {/* ══════════════════════════════════════════════════════════════════
            HERO — full-bleed, brand-led (reference layout)
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-end sm:items-center -mt-16 pb-16 pt-28 sm:pb-20 sm:pt-24">
          {/* Full-bleed photographic plane */}
          <div className="absolute inset-0">
            <img
              src={heroImg}
              alt=""
              className="h-full w-full object-cover object-center scale-[1.02]"
            />
            {/* Light wash — keep image visible, soft shade only behind text */}
            <div className="absolute inset-0 bg-ink-900/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-transparent to-ink-900/15" />
          </div>

          {/* Gold hairline under nav */}
          <div className="absolute top-16 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent z-10" />

          <div className="relative z-10 container-page w-full">
            <div className="max-w-xl lg:max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {/* Eyebrow */}
                <div className="mb-5 flex items-center gap-3">
                  <p className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Your Gateway to Islamic Knowledge
                  </p>
                  <span className="hidden sm:block h-px w-16 bg-accent/70" aria-hidden />
                </div>

                {/* Brand headline — white + gold split like reference */}
                <h1 className="font-cinzel text-[2.35rem] leading-[1.12] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-wide">
                  <span className="block text-white drop-shadow-md">The Islamic</span>
                  <span className="block text-accent drop-shadow-md">Digital Library</span>
                </h1>

                <p className="mt-5 max-w-lg text-[15px] sm:text-base leading-relaxed text-white/85">
                  Explore authentic Islamic books, scholarly works, and timeless knowledge — all in one place.
                </p>

                {/* Hero search */}
                <motion.form
                  onSubmit={submitHeroSearch}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-8 flex w-full max-w-xl overflow-hidden rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
                >
                  <div className="relative flex flex-1 items-center">
                    <Search size={18} className="absolute left-4 text-ink-400 pointer-events-none" />
                    <input
                      type="search"
                      value={heroQuery}
                      onChange={(e) => setHeroQuery(e.target.value)}
                      placeholder="Search by title, author, subject..."
                      className="w-full bg-transparent py-3.5 pl-11 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                      aria-label="Search the library"
                    />
                  </div>
                  <button
                    type="submit"
                    className="m-1.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-accent-light"
                  >
                    Search
                    <ArrowRight size={15} strokeWidth={2.25} />
                  </button>
                </motion.form>

                {/* In-hero stats — reference composition */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mt-10 grid grid-cols-3 gap-x-4 gap-y-6 sm:flex sm:flex-wrap sm:items-start sm:gap-8 lg:gap-10"
                >
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-start gap-1.5 min-w-[4.5rem]">
                      <s.icon size={18} className="text-accent" strokeWidth={1.75} />
                      <p className="font-cinzel text-lg sm:text-xl font-semibold leading-none text-accent">
                        {s.value}
                      </p>
                      <p className="text-[11px] sm:text-xs font-medium tracking-wide text-white/75">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Soft bottom fade into library */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent z-10" />
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            LIBRARY SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section ref={libraryRef} id="library" className="bg-paper py-12 sm:py-16 scroll-mt-20">
          <div className="container-page">
            <div className="mb-8">
              <p className="mb-1 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                The Collection
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Browse the Library</h2>
              <p className="mt-2 text-ink-500">
                Filter by era, scholar, or subject — or search for anything.
              </p>
            </div>

            <div className="relative mb-6 max-w-2xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full rounded-lg border border-line bg-cream py-3 pl-12 pr-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-accent focus:outline-none"
              />
              {filters.query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-cream px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <span className="text-sm text-ink-500">{filteredBooks.length} results</span>
            </div>

            <div className="flex gap-8">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <LibraryFilters
                    filters={filters}
                    onTogglePeriod={togglePeriod}
                    onToggleCategory={toggleCategory}
                    onToggleScholar={toggleScholar}
                    onClearAll={clearAll}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <span className="text-sm font-medium text-ink-900">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={filters.sort}
                        onChange={(e) => setSort(e.target.value as SortOption)}
                        className="appearance-none rounded-lg border border-line bg-cream py-2 pl-3 pr-8 text-sm text-ink-800 focus:border-accent focus:outline-none cursor-pointer"
                      >
                        {sortOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 text-xs">
                        ▾
                      </span>
                    </div>
                    <div className="flex rounded-lg border border-line bg-cream">
                      <button
                        onClick={() => setLibView('grid')}
                        className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                          libView === 'grid' ? 'bg-ink-900 text-cream' : 'text-ink-500 hover:text-ink-900'
                        }`}
                        aria-label="Grid view"
                        aria-pressed={libView === 'grid'}
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button
                        onClick={() => setLibView('list')}
                        className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                          libView === 'list' ? 'bg-ink-900 text-cream' : 'text-ink-500 hover:text-ink-900'
                        }`}
                        aria-label="List view"
                        aria-pressed={libView === 'list'}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen size={40} className="text-ink-300" />
                    <h3 className="mt-4 font-serif text-lg font-semibold text-ink-900">No books found</h3>
                    <p className="mt-2 text-sm text-ink-500 max-w-sm">
                      {hasActiveFilters
                        ? 'No books match the current filters. Try adjusting or clearing your filters.'
                        : 'No books match your search.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAll}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-ink-800"
                      >
                        <X size={14} /> Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <BookGrid books={filteredBooks} variant={libView} />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Drawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filters"
        width="w-80"
      >
        <LibraryFilters
          filters={filters}
          onTogglePeriod={togglePeriod}
          onToggleCategory={toggleCategory}
          onToggleScholar={toggleScholar}
          onClearAll={clearAll}
          hasActiveFilters={hasActiveFilters}
        />
      </Drawer>
    </PageContainer>
  );
}
