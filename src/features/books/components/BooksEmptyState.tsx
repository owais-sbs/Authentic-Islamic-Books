import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

interface BooksEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function BooksEmptyState({ hasFilters, onClearFilters }: BooksEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F0EB] mb-4">
          <Upload size={22} className="text-[#94A3B8]" />
        </div>
        <h3 className="text-[15px] font-semibold text-[#0B1B2B]">No books found</h3>
        <p className="mt-1 text-sm text-[#64748B]">Try changing your search or filters.</p>
        <button
          onClick={onClearFilters}
          className="mt-4 rounded-lg border border-[#E5E1D8] bg-white px-4 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2]"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A646]/10 mb-5">
        <Upload size={26} className="text-[#C9A646]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#0B1B2B]">No books yet</h3>
      <p className="mt-1.5 text-sm text-[#64748B] max-w-xs">
        Start building your library by importing your first PDF.
      </p>
      <Link
        to="/admin/books/import"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#162A42]"
      >
        <Upload size={14} />
        Import Your First Book
      </Link>
    </div>
  );
}
