import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, PlusCircle, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BooksToolbar } from '@/features/books/components/BooksToolbar';
import { BooksTable } from '@/features/books/components/BooksTable';
import {
  mockBooks,
  applyFiltersAndSort,
  getBooksStats,
  TOTAL_BOOKS_COUNT,
  PAGE_SIZE,
} from '@/features/books/data/mockBooks';
import type { BooksFilters, BooksSortKey } from '@/features/books/types';

// ─── Default filter state ─────────────────────────────────────────────────────
const DEFAULT_FILTERS: BooksFilters = {
  search: '',
  status: '',
  category: '',
  author: '',
  hijriPeriod: '',
};

// ─── Compact stat card ────────────────────────────────────────────────────────
interface StatProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconCls: string;
  bgCls: string;
}

function StatCard({ label, value, icon: Icon, iconCls, bgCls }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E5E1D8] bg-white px-4 py-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgCls}`}>
        <Icon size={16} className={iconCls} />
      </div>
      <div>
        <p className="text-[22px] font-bold leading-tight text-[#0B1B2B]">{value}</p>
        <p className="text-[12px] text-[#64748B]">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminBooksPage() {
  const [filters, setFilters] = useState<BooksFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<BooksSortKey>('updatedAt_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const stats = getBooksStats(mockBooks);

  function handleFiltersChange(f: BooksFilters) {
    setFilters(f);
    setCurrentPage(1);
  }
  function handleSortChange(s: BooksSortKey) {
    setSort(s);
    setCurrentPage(1);
  }
  function handleClear() {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const filtered = useMemo(
    () => applyFiltersAndSort(mockBooks, filters, sort),
    [filters, sort]
  );

  const totalItems = hasActiveFilters ? filtered.length : TOTAL_BOOKS_COUNT;

  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <AdminShell pageTitle="Books">
      <div className="max-w-6xl space-y-6">

        {/* Header */}
        <AdminPageHeader
          title="Books"
          description="Manage and review your Islamic Digital Library collection."
          actions={
            <div className="flex items-center gap-2">
              <Link
                to="/admin/books/import"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C9A646] px-4 py-2.5 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d]"
              >
                <Upload size={14} />
                Import Book
              </Link>
              <Link
                to="/admin/books/import?manual=1"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E1D8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2]"
              >
                <PlusCircle size={14} />
                Add Manually
              </Link>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Books"
            value={stats.total.toLocaleString()}
            icon={BookOpen}
            iconCls="text-[#C9A646]"
            bgCls="bg-[#C9A646]/10"
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={CheckCircle}
            iconCls="text-emerald-600"
            bgCls="bg-emerald-50"
          />
          <StatCard
            label="Needs Review"
            value={stats.needsReview}
            icon={AlertCircle}
            iconCls="text-amber-600"
            bgCls="bg-amber-50"
          />
          <StatCard
            label="Drafts"
            value={stats.drafts}
            icon={Clock}
            iconCls="text-slate-500"
            bgCls="bg-slate-100"
          />
        </div>

        {/* Toolbar */}
        <BooksToolbar
          filters={filters}
          sort={sort}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClear}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Count row */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#64748B]">
            {hasActiveFilters ? (
              <><span className="font-medium text-[#0B1B2B]">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''} found</>
            ) : (
              <><span className="font-medium text-[#0B1B2B]">{TOTAL_BOOKS_COUNT.toLocaleString()}</span> books total</>
            )}
          </p>
        </div>

        {/* Table */}
        <BooksTable
          books={paged}
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          hasFilters={hasActiveFilters}
          onPageChange={setCurrentPage}
          onClearFilters={handleClear}
        />
      </div>
    </AdminShell>
  );
}
