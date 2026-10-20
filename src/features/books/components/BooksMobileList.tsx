import { Link } from 'react-router-dom';
import { BookStatusBadge } from './BookStatusBadge';
import { BookActions } from './BookActions';
import { resolveAuthorName } from './resolveAuthorName';
import { formatDate } from '@/lib/utils';
import type { Book } from '../types';

interface BooksMobileListProps {
  books: Book[];
  onActionComplete?: () => void;
}

function CoverThumb({ book }: { book: Book }) {
  return (
    <div
      className="h-12 w-9 shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-black/5"
      style={{ backgroundColor: book.coverColor }}
    >
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

export function BooksMobileList({ books, onActionComplete }: BooksMobileListProps) {
  return (
    <ul className="divide-y divide-[#E5E1D8]">
      {books.map((book) => {
        const editHref = `/admin/books/${book.id}/review`;
        const author = resolveAuthorName(book.authorName, book.authorId);
        const title = book.title?.trim() || 'Untitled';

        return (
          <li key={book.id} className="flex items-center gap-3 px-4 py-3.5">
            <CoverThumb book={book} />

            <div className="min-w-0 flex-1">
              <Link
                to={editHref}
                className="line-clamp-2 text-[13px] font-medium leading-snug text-[#0B1B2B] transition-colors hover:text-[#C9A646]"
              >
                {title}
              </Link>
              <p className="mt-0.5 truncate text-[12px] text-[#64748B]">{author}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <BookStatusBadge status={book.status} />
                <span className="text-[11px] text-[#94A3B8]">
                  {formatDate(book.updatedAt)}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <BookActions book={book} onActionComplete={onActionComplete} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
