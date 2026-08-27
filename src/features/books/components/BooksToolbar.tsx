import { Search, X } from 'lucide-react';
import type { BooksFilters, BooksSortKey } from '../types';
import { ALL_AUTHORS, ALL_CATEGORIES, HIJRI_PERIODS } from '../data/mockBooks';

interface BooksToolbarProps {
  filters: BooksFilters;
  sort: BooksSortKey;
  onFiltersChange: (f: BooksFilters) => void;
  onSortChange: (s: BooksSortKey) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const selectCls =
  'h-9 rounded-lg border border-[#E5E1D8] bg-white px-3 text-[13px] text-[#0B1B2B] outline-none transition-colors focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/30 cursor-pointer';

export function BooksToolbar({ filters, sort, onFiltersChange, onSortChange, onClearFilters, hasActiveFilters }: BooksToolbarProps) {
  function set<K extends keyof BooksFilters>(key: K, value: BooksFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search books, authors, scholars..."
            className="h-9 w-full rounded-lg border border-[#E5E1D8] bg-white pl-9 pr-4 text-[13px] text-[#0B1B2B] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/30"
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={sort} onChange={(e) => onSortChange(e.target.value as BooksSortKey)} className={`${selectCls} sm:w-44`}>
          <option value="updatedAt_desc">Recently Updated</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
        </select>
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="needs_review">Needs Review</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
          <option value="archived">Archived</option>
          <option value="failed">Failed</option>
        </select>
        <select value={filters.category} onChange={(e) => set('category', e.target.value)} className={selectCls}>
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.author} onChange={(e) => set('author', e.target.value)} className={selectCls}>
          <option value="">All Authors</option>
          {ALL_AUTHORS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filters.hijriPeriod} onChange={(e) => set('hijriPeriod', e.target.value)} className={selectCls}>
          <option value="">All Periods</option>
          {HIJRI_PERIODS.map((p) => <option key={p.label} value={`${p.start}-${p.end}`}>{p.label}</option>)}
        </select>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 text-[13px] font-medium text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0B1B2B]"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
