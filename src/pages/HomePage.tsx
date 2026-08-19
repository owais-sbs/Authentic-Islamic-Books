import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Type,
  Compass,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { books as allBooks } from '@/data/books';
import { scholars as allScholars } from '@/data/scholars';
import { categories } from '@/data/categories';
import { BookGrid } from '@/components/library/BookGrid';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { Drawer } from '@/components/ui/Drawer';
import { useLibraryFilters, type SortOption } from '@/hooks/useLibraryFilters';
import heroImg from '@/assets/home.jpeg';

// ---------------------------------------------------------------------------
// Hero slides — Islamic imagery, lighter overlays
// ---------------------------------------------------------------------------
const slides = [
  {
    bg: heroImg,
    isLocal: true,
    badge: '100 AH – 1448 AH · A Legacy of Wisdom',
    heading: 'The Islamic Digital Library',
  },
  {
    bg: 'https://images.pexels.com/photos/6033956/pexels-photo-6033956.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    isLocal: false,
    badge: 'Centuries of Scholarship',
    heading: 'Explore the Scholars',
  },
  {
    // Islamic architecture — Pinterest
    bg: 'https://i.pinimg.com/736x/7f/a9/65/7fa9657ed8b1670d8f8629312765fe1e.jpg',
    isLocal: false,
    badge: 'Read Anywhere',
    heading: 'A New Way to Read',
  },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

export function HomePage() {
  // ── Slider state ──────────────────────────────────────────────────────────
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  // ── Library section state ─────────────────────────────────────────────────
  const {
    filters,
    filteredBooks,
    togglePeriod,
    toggleCategory,
    toggleScholar,
    setQuery,
    setSort,
    clearAll,
    hasActiveFilters,
  } = useLibraryFilters();

  const [libView, setLibView] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // ── Stats data ────────────────────────────────────────────────────────────
  const stats = [
    { icon: BookOpen, value: `${allBooks.length}+`,    label: 'Books' },
    { icon: Users,    value: `${allScholars.length}+`, label: 'Scholars' },
    { icon: Clock,    value: '14',                     label: 'Centuries' },
    { icon: Compass,  value: `${categories.length}+`,  label: 'Subjects' },
    { icon: Type,     value: 'English',                label: 'Only' },
  ];

  return (
    <PageContainer>
      <div>
        {/* ══════════════════════════════════════════════════════════════════
            HERO SLIDER — half screen, minimal, clean
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden h-[50vh] min-h-[340px] max-h-[520px] flex items-center -mt-16">
          {/* Slides */}
          <AnimatePresence initial={false}>
            <motion.div
              key={current}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <img
                src={slides[current].bg}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              {/* Light overlay — not too dark */}
              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />
            </motion.div>
          </AnimatePresence>

          {/* Gold top line */}
          <div className="absolute top-16 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent z-10" />

          {/* Minimal centred content */}
          <div className="relative z-10 container-page w-full">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="max-w-xl"
              >
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3.5 py-1 backdrop-blur-sm">
                  <span className="text-[11px] font-medium tracking-wide text-accent">{slides[current].badge}</span>
                </div>

                {/* Single clean heading */}
                <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.15] tracking-wide drop-shadow-lg">
                  {slides[current].heading}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev / Next arrows removed — dots only */}

          {/* Dot navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-ink-900 border-b border-ink-700">
          <div className="container-page">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-5 divide-x divide-ink-700"
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 py-4 px-1">
                  <s.icon size={15} className="shrink-0 text-accent" />
                  <p className="font-serif text-sm font-semibold leading-tight text-white">{s.value}</p>
                  <p className="text-[10px] leading-tight text-ink-400">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            LIBRARY SECTION — light theme, inline
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-paper py-12 sm:py-16">
          <div className="container-page">
            {/* Section header */}
            <div className="mb-8">
              <p className="mb-1 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                The Collection
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Browse the Library</h2>
              <p className="mt-2 text-ink-500">
                Filter by era, scholar, or subject — or search for anything.
              </p>
            </div>

            {/* Search bar */}
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

            {/* Mobile filter button */}
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
              {/* Desktop sidebar */}
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

              {/* Results */}
              <div className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <span className="text-sm font-medium text-ink-900">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Sort */}
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
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 text-xs">▾</span>
                    </div>
                    {/* View toggle */}
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

                {/* Book grid or empty state */}
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
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${libView}-${filteredBooks.length}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <BookGrid books={filteredBooks} variant={libView} />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile filter drawer */}
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
