import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, SlidersHorizontal, X, BookOpen } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { BookGrid } from '@/components/library/BookGrid';
import { Drawer } from '@/components/ui/Drawer';
import { useLibraryFilters, type SortOption } from '@/hooks/useLibraryFilters';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

export function LibraryPage() {
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

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const sortLabel = sortOptions.find((s) => s.value === filters.sort)?.label || 'Most Popular';

  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Library' }]} />

        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">Islamic Library</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Browse {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} from across centuries of Islamic scholarship. Filter by Hijri period, scholar, or subject.
          </p>
        </div>

        {/* Search */}
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
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink-900">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}</span>
              </div>
              <div className="flex items-center gap-3">
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
                    onClick={() => setView('grid')}
                    className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                      view === 'grid' ? 'bg-ink-900 text-cream' : 'text-ink-500 hover:text-ink-900'
                    }`}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                      view === 'list' ? 'bg-ink-900 text-cream' : 'text-ink-500 hover:text-ink-900'
                    }`}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
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
                  key={`${view}-${filteredBooks.length}-${searchParams.toString()}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <BookGrid books={filteredBooks} variant={view} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
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
