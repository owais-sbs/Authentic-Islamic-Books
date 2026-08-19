import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { hijriPeriods } from '@/data/periods';
import { categories } from '@/data/categories';
import { scholars as allScholars } from '@/data/scholars';
import { books as allBooks } from '@/data/books';
import { Checkbox } from '@/components/ui/Checkbox';
import type { FilterState } from '@/hooks/useLibraryFilters';

interface LibraryFiltersProps {
  filters: FilterState;
  onTogglePeriod: (id: string) => void;
  onToggleCategory: (slug: string) => void;
  onToggleScholar: (slug: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export function LibraryFilters({
  filters,
  onTogglePeriod,
  onToggleCategory,
  onToggleScholar,
  onClearAll,
  hasActiveFilters,
}: LibraryFiltersProps) {
  const [scholarSearch, setScholarSearch] = useState('');

  const bookCountsByPeriod = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const period of hijriPeriods) {
      counts[period.id] = allBooks.filter(
        (b) => b.hijriStart >= period.start && b.hijriEnd <= period.end
      ).length;
    }
    return counts;
  }, []);

  const filteredScholars = useMemo(() => {
    if (!scholarSearch.trim()) return allScholars;
    const q = scholarSearch.toLowerCase();
    return allScholars.filter((s) => s.name.toLowerCase().includes(q));
  }, [scholarSearch]);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <SlidersHorizontal size={16} /> Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-ink-500 transition-colors hover:text-accent-dark"
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Hijri Period */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">
          Hijri Period
        </h3>
        <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
          {hijriPeriods.map((period) => (
            <Checkbox
              key={period.id}
              checked={filters.periods.includes(period.id)}
              onChange={() => onTogglePeriod(period.id)}
              label={period.label}
              count={bookCountsByPeriod[period.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">
          Category
        </h3>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <Checkbox
              key={cat.id}
              checked={filters.categories.includes(cat.slug)}
              onChange={() => onToggleCategory(cat.slug)}
              label={cat.name}
            />
          ))}
        </div>
      </div>

      {/* Scholar */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">
          Scholar
        </h3>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={scholarSearch}
            onChange={(e) => setScholarSearch(e.target.value)}
            placeholder="Search scholars..."
            className="w-full rounded-lg border border-line bg-cream py-2 pl-9 pr-3 text-xs text-ink-800 placeholder:text-ink-400 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
          {filteredScholars.map((scholar) => (
            <Checkbox
              key={scholar.id}
              checked={filters.scholars.includes(scholar.slug)}
              onChange={() => onToggleScholar(scholar.slug)}
              label={scholar.name}
              count={allBooks.filter((b) => b.authorId === scholar.id).length}
            />
          ))}
          {filteredScholars.length === 0 && (
            <p className="py-2 text-xs text-ink-400">No scholars found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
