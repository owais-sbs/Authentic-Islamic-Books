import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, BookOpen, CheckCircle, Clock, AlertCircle, Archive } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BooksToolbar } from '@/features/books/components/BooksToolbar';
import { BooksTable } from '@/features/books/components/BooksTable';
import { PAGE_SIZE, useAdminBooks } from '@/hooks/useAdminBooks';
import type { BooksFilters, BooksSortKey } from '@/features/books/types';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: BooksFilters = {
  search: '',
  status: '',
  category: '',
  author: '',
  hijriPeriod: '',
};

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

export function AdminBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewArchived = searchParams.get('view') === 'archived';

  const [filters, setFilters] = useState<BooksFilters>(() => ({
    ...DEFAULT_FILTERS,
    status: viewArchived ? 'archived' : '',
  }));
  const [sort, setSort] = useState<BooksSortKey>('updatedAt_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const { filtered, stats, refresh } = useAdminBooks(filters, sort);

  useEffect(() => {
    setFilters((f) => ({ ...f, status: viewArchived ? 'archived' : f.status === 'archived' ? '' : f.status }));
    setCurrentPage(1);
  }, [viewArchived]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '') || viewArchived;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function handleFiltersChange(f: BooksFilters) {
    setFilters(f);
    setCurrentPage(1);
    if (f.status === 'archived' && !viewArchived) {
      setSearchParams({ view: 'archived' });
    } else if (f.status !== 'archived' && viewArchived) {
      setSearchParams({});
    }
  }

  function setView(archived: boolean) {
    if (archived) {
      setSearchParams({ view: 'archived' });
      setFilters((f) => ({ ...f, status: 'archived' }));
    } else {
      setSearchParams({});
      setFilters((f) => ({ ...f, status: '' }));
    }
    setCurrentPage(1);
  }

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  return (
    <AdminShell pageTitle="Books">
      <div className="max-w-6xl space-y-6">
        <AdminPageHeader
          title={viewArchived ? 'Archived Books' : 'Books'}
          description={
            viewArchived
              ? 'Books moved to archive. Restore or permanently delete them.'
              : 'Manage and review your Islamic Digital Library collection.'
          }
          actions={
            <Link
              to="/admin/books/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A646] px-4 py-2.5 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d]"
            >
              <PlusCircle size={14} />
              Add New Book
            </Link>
          }
        />

        {/* View tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView(false)}
            className={cn(
              'rounded-lg px-4 py-2 text-[13px] font-medium transition-colors',
              !viewArchived
                ? 'bg-[#0B1B2B] text-white'
                : 'border border-[#E5E1D8] bg-white text-[#64748B] hover:bg-[#F7F6F2]'
            )}
          >
            All Books
          </button>
          <button
            type="button"
            onClick={() => setView(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors',
              viewArchived
                ? 'bg-[#0B1B2B] text-white'
                : 'border border-[#E5E1D8] bg-white text-[#64748B] hover:bg-[#F7F6F2]'
            )}
          >
            <Archive size={14} />
            Archived
            {'archived' in stats && (stats as { archived?: number }).archived
              ? ` (${(stats as { archived?: number }).archived})`
              : ''}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Books" value={stats.total} icon={BookOpen} iconCls="text-[#C9A646]" bgCls="bg-[#C9A646]/10" />
          <StatCard label="Published" value={stats.published} icon={CheckCircle} iconCls="text-emerald-600" bgCls="bg-emerald-50" />
          <StatCard label="Needs Review" value={stats.needsReview} icon={AlertCircle} iconCls="text-amber-600" bgCls="bg-amber-50" />
          <StatCard label="Drafts" value={stats.drafts} icon={Clock} iconCls="text-slate-500" bgCls="bg-slate-100" />
        </div>

        <BooksToolbar
          filters={filters}
          sort={sort}
          onFiltersChange={handleFiltersChange}
          onSortChange={(s) => { setSort(s); setCurrentPage(1); }}
          onClearFilters={() => { setFilters(DEFAULT_FILTERS); setSearchParams({}); setCurrentPage(1); }}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#64748B]">
            <span className="font-medium text-[#0B1B2B]">{totalItems}</span> book{totalItems !== 1 ? 's' : ''}
            {viewArchived ? ' archived' : hasActiveFilters ? ' matching filters' : ''}
          </p>
        </div>

        <BooksTable
          books={paged}
          totalItems={totalItems}
          currentPage={safePage}
          pageSize={PAGE_SIZE}
          hasFilters={hasActiveFilters}
          onPageChange={setCurrentPage}
          onClearFilters={() => { setFilters(DEFAULT_FILTERS); setSearchParams({}); setCurrentPage(1); }}
          onActionComplete={refresh}
        />
      </div>
    </AdminShell>
  );
}
