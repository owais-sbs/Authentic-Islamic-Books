import { Link } from 'react-router-dom';
import { BookStatusBadge } from './BookStatusBadge';
import { BookActions } from './BookActions';
import { formatDate } from '@/lib/utils';
import type { Book } from '../types';

function CoverThumb({ book }: { book: Book }) {
  return (
    <div
      className="h-14 w-10 shrink-0 rounded-md shadow-sm overflow-hidden"
      style={{ backgroundColor: book.coverColor }}
    >
      {book.coverUrl && <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

export function BooksMobileList({ books }: { books: Book[] }) {
  return (
    <ul className="divide-y divide-[#E5E1D8]">
      {books.map((book) => (
        <li key={book.id} className="flex items-start gap-3 px-4 py-4">
          <CoverThumb book={book} />
          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/books/${book.id}/review`}
              className="block text-[14px] font-semibold text-[#0B1B2B] leading-snug hover:text-[#C9A646] transition-colors"
            >
              {book.title}
            </Link>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{book.authorName ?? '—'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <BookStatusBadge status={book.status} />
              {book.hijriStartYear && (
                <span className="text-[11px] text-[#94A3B8]">
                  {book.hijriStartYear}–{book.hijriEndYear} AH
                </span>
              )}
              {book.chapterCount != null && (
                <span className="text-[11px] text-[#94A3B8]">{book.chapterCount} ch.</span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {book.categories.slice(0, 2).map((c) => (
                <span key={c} className="rounded-md bg-[#F7F6F2] px-2 py-0.5 text-[11px] text-[#64748B] border border-[#E5E1D8]">{c}</span>
              ))}
              {book.categories.length > 2 && (
                <span className="rounded-md bg-[#F7F6F2] px-2 py-0.5 text-[11px] text-[#94A3B8] border border-[#E5E1D8]">+{book.categories.length - 2}</span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-[#94A3B8]">Updated {formatDate(book.updatedAt)}</p>
          </div>
          <div className="shrink-0"><BookActions book={book} /></div>
        </li>
      ))}
    </ul>
  );
}
