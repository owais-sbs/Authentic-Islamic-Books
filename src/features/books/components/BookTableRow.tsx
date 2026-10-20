import { Link } from 'react-router-dom';
import { BookStatusBadge } from './BookStatusBadge';
import { BookCategoryBadges } from './BookCategoryBadges';
import { BookActions } from './BookActions';
import { resolveAuthorName } from './resolveAuthorName';
import { formatDate } from '@/lib/utils';
import type { Book } from '../types';

function CoverThumb({ book }: { book: Book }) {
  return (
    <div
      className="h-11 w-8 shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-black/5"
      style={{ backgroundColor: book.coverColor }}
      aria-label={`Cover: ${book.title}`}
    >
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

interface BookTableRowProps {
  book: Book;
  onActionComplete?: () => void;
}

export function BookTableRow({ book, onActionComplete }: BookTableRowProps) {
  const reviewHref = `/admin/books/${book.id}/review`;
  const author = resolveAuthorName(book.authorName, book.authorId);
  const title = book.title?.trim() || 'Untitled';

  return (
    <tr className="group border-b border-[#E5E1D8] last:border-b-0 transition-colors hover:bg-[#FAFAF8]">
      <td className="py-3 pl-5 pr-3">
        <CoverThumb book={book} />
      </td>

      <td className="max-w-[280px] px-3 py-3">
        <Link
          to={reviewHref}
          className="line-clamp-2 text-[13px] font-medium leading-snug text-[#0B1B2B] transition-colors hover:text-[#C9A646]"
          title={title}
        >
          {title}
        </Link>
        {book.subtitle?.trim() ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-[#94A3B8]">
            {book.subtitle}
          </p>
        ) : null}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#475569]">
        {author}
      </td>

      <td className="px-3 py-3">
        {book.categories.length > 0 ? (
          <BookCategoryBadges categories={book.categories} max={2} />
        ) : (
          <span className="text-[12px] text-[#CBD5E1]">—</span>
        )}
      </td>

      <td className="px-3 py-3">
        <BookStatusBadge status={book.status} />
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-[12px] text-[#94A3B8]">
        {formatDate(book.updatedAt)}
      </td>

      <td className="py-3 pl-2 pr-4 text-right">
        <div className="flex justify-end">
          <BookActions book={book} onActionComplete={onActionComplete} />
        </div>
      </td>
    </tr>
  );
}
