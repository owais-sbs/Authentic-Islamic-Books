import { BookTableRow } from './BookTableRow';
import { BooksMobileList } from './BooksMobileList';
import { BooksEmptyState } from './BooksEmptyState';
import { BooksTableSkeleton } from './BooksTableSkeleton';
import { BooksPagination } from './BooksPagination';
import type { Book } from '../types';

interface BooksTableProps {
  books: Book[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

const TH = 'px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] whitespace-nowrap';

export function BooksTable({
  books, totalItems, currentPage, pageSize, isLoading = false,
  hasFilters, onPageChange, onClearFilters,
}: BooksTableProps) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-[#E5E1D8] bg-[#F7F6F2]">
              <th className="pl-5 pr-3 py-3 w-12" />
              <th className={TH}>Book</th>
              <th className={TH}>Author</th>
              <th className={TH}>Categories</th>
              <th className={TH}>Hijri Period</th>
              <th className={TH}>Structure</th>
              <th className={TH}>Status</th>
              <th className={TH}>Updated</th>
              <th className="pl-3 pr-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8]">
            {!isLoading && books.map((book) => <BookTableRow key={book.id} book={book} />)}
          </tbody>
        </table>
        {isLoading && <BooksTableSkeleton />}
        {!isLoading && books.length === 0 && (
          <BooksEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {isLoading ? <BooksTableSkeleton /> :
          books.length === 0 ? <BooksEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} /> :
          <BooksMobileList books={books} />}
      </div>

      {!isLoading && books.length > 0 && (
        <BooksPagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
