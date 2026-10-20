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
  onActionComplete?: () => void;
}

const TH =
  'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] whitespace-nowrap';

export function BooksTable({
  books,
  totalItems,
  currentPage,
  pageSize,
  isLoading = false,
  hasFilters,
  onPageChange,
  onClearFilters,
  onActionComplete,
}: BooksTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E1D8] bg-white shadow-sm">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse">
          <colgroup>
            <col className="w-14" />
            <col />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-12" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#E5E1D8] bg-[#F7F6F2]">
              <th className="py-2.5 pl-5 pr-3" scope="col">
                <span className="sr-only">Cover</span>
              </th>
              <th className={TH} scope="col">
                Book
              </th>
              <th className={TH} scope="col">
                Author
              </th>
              <th className={TH} scope="col">
                Categories
              </th>
              <th className={TH} scope="col">
                Status
              </th>
              <th className={TH} scope="col">
                Updated
              </th>
              <th className="py-2.5 pl-2 pr-4 text-right" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              books.map((book) => (
                <BookTableRow
                  key={book.id}
                  book={book}
                  onActionComplete={onActionComplete}
                />
              ))}
          </tbody>
        </table>
        {isLoading && <BooksTableSkeleton />}
        {!isLoading && books.length === 0 && (
          <BooksEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        )}
      </div>

      <div className="md:hidden">
        {isLoading ? (
          <BooksTableSkeleton />
        ) : books.length === 0 ? (
          <BooksEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        ) : (
          <BooksMobileList books={books} onActionComplete={onActionComplete} />
        )}
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
