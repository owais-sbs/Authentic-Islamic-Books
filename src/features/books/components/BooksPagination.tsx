import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BooksPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function BooksPagination({ currentPage, totalItems, pageSize, onPageChange }: BooksPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5E1D8] px-5 py-4 sm:flex-row">
      <p className="text-[13px] text-[#64748B]">
        Showing <span className="font-medium text-[#0B1B2B]">{start}–{end}</span> of{' '}
        <span className="font-medium text-[#0B1B2B]">{totalItems.toLocaleString()}</span> books
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E1D8] bg-white text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-[13px] text-[#94A3B8]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-medium transition-colors',
                p === currentPage
                  ? 'bg-[#0B1B2B] text-white'
                  : 'border border-[#E5E1D8] bg-white text-[#0B1B2B] hover:bg-[#F7F6F2]'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E1D8] bg-white text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
