import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookStatusBadge } from './BookStatusBadge';
import { BookCategoryBadges } from './BookCategoryBadges';
import { BookActions } from './BookActions';
import { formatDate } from '@/lib/utils';
import type { Book } from '../types';

function CoverThumb({ book }: { book: Book }) {
  return (
    <div
      className="h-12 w-9 shrink-0 rounded-md shadow-sm overflow-hidden"
      style={{ backgroundColor: book.coverColor }}
      aria-label={`Cover: ${book.title}`}
    >
      {book.coverUrl && (
        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

interface BookTableRowProps {
  book: Book;
  onActionComplete?: () => void;
}

export function BookTableRow({ book, onActionComplete }: BookTableRowProps) {
  const reviewHref = `/admin/books/${book.id}/review`;
  const structureLabel =
    book.chapterCount != null
      ? `${book.chapterCount} Ch.${book.sectionCount != null ? ` / ${book.sectionCount} Sec.` : ''}`
      : '—';

  return (
    <motion.tr
      layout
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, x: 48, transition: { duration: 0.45 } }}
      className="transition-colors hover:bg-[#FAFAF8]"
    >
      <td className="pl-5 pr-3 py-3.5"><CoverThumb book={book} /></td>

      <td className="px-3 py-3.5 max-w-[200px]">
        <Link
          to={reviewHref}
          className="block text-[13px] font-medium text-[#0B1B2B] hover:text-[#C9A646] leading-snug transition-colors"
        >
          {book.title}
        </Link>
        {book.subtitle && (
          <p className="mt-0.5 text-[11px] text-[#94A3B8] leading-snug line-clamp-1">{book.subtitle}</p>
        )}
      </td>

      <td className="px-3 py-3.5 whitespace-nowrap text-[13px] text-[#64748B]">
        {book.authorName ?? '—'}
      </td>

      <td className="px-3 py-3.5">
        {book.categories.length > 0
          ? <BookCategoryBadges categories={book.categories} max={2} />
          : <span className="text-[12px] text-[#CBD5E1]">—</span>
        }
      </td>

      <td className="px-3 py-3.5 whitespace-nowrap text-[13px] text-[#64748B]">
        {book.hijriStartYear && book.hijriEndYear
          ? `${book.hijriStartYear}–${book.hijriEndYear} AH`
          : '—'}
      </td>

      <td className="px-3 py-3.5 whitespace-nowrap text-[13px] text-[#64748B]">
        {structureLabel}
      </td>

      <td className="px-3 py-3.5">
        <BookStatusBadge status={book.status} />
      </td>

      <td className="px-3 py-3.5 whitespace-nowrap text-[13px] text-[#94A3B8]">
        {formatDate(book.updatedAt)}
      </td>

      <td className="pl-3 pr-5 py-3.5">
        <BookActions book={book} onActionComplete={onActionComplete} />
      </td>
    </motion.tr>
  );
}
