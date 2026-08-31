import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { Book } from '@/types';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { formatHijriRange } from '@/data/periods';
import { BookCover } from '@/components/book/BookCover';
import { BookBookmarkButton } from '@/components/book/BookBookmarkButton';
import { Badge } from '@/components/ui/Badge';

interface BookCardProps {
  book: Book;
  variant?: 'grid' | 'list';
}

export function BookCard({ book, variant = 'grid' }: BookCardProps) {
  const scholar = getScholarById(book.authorId);
  const category = getCategoryById(book.categoryIds[0]);
  // For imported books, authorId may be a placeholder — fall back to authorName
  const authorDisplay = scholar
    ? scholar.name
    : (book as Book & { authorName?: string }).authorName ?? null;

  if (variant === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group flex gap-5 border border-line bg-cream rounded-xl p-5 transition-all hover:border-line-strong hover:shadow-sm relative"
      >
        <div className="absolute top-3 right-3 z-10">
          <BookBookmarkButton
            slug={book.slug}
            title={book.title}
            coverColor={book.coverColor}
            coverUrl={book.coverUrl}
            size="sm"
          />
        </div>
        <Link to={`/books/${book.slug}`} className="shrink-0">
          <BookCover book={book} size="md" className="transition-transform group-hover:scale-[1.02]" />
        </Link>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {category && <Badge variant="accent">{category.name}</Badge>}
            <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
          </div>
          <Link to={`/books/${book.slug}`}>
            <h3 className="font-serif text-lg font-semibold text-ink-900 transition-colors group-hover:text-accent-dark">
              {book.title}
            </h3>
          </Link>
          {book.subtitle && <p className="text-sm text-ink-500 mt-0.5 line-clamp-1">{book.subtitle}</p>}
          {authorDisplay && (
            scholar ? (
              <Link to={`/scholars/${scholar.slug}`} className="mt-1 text-sm text-ink-600 transition-colors hover:text-accent-dark">
                {authorDisplay}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-ink-600">{authorDisplay}</p>
            )
          )}
          <p className="mt-2 text-sm leading-relaxed text-ink-500 line-clamp-2">{book.description}</p>
          <div className="mt-auto pt-3">
            <Link
              to={`/books/${book.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors hover:text-accent-dark"
            >
              Read <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col border border-line bg-cream rounded-xl p-5 transition-all hover:border-line-strong hover:shadow-md relative"
    >
      <div className="absolute top-3 right-3 z-10">
        <BookBookmarkButton
          slug={book.slug}
          title={book.title}
          coverColor={book.coverColor}
          coverUrl={book.coverUrl}
          size="sm"
        />
      </div>
      <Link to={`/books/${book.slug}`} className="mb-4 flex justify-center">
        <BookCover book={book} size="md" className="transition-transform duration-300 group-hover:scale-[1.03] group-hover:-rotate-1" />
      </Link>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {category && <Badge variant="accent">{category.name}</Badge>}
        <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
      </div>
      <Link to={`/books/${book.slug}`}>
        <h3 className="font-serif text-base font-semibold leading-snug text-ink-900 transition-colors group-hover:text-accent-dark line-clamp-2">
          {book.title}
        </h3>
      </Link>
      {authorDisplay && (
        scholar ? (
          <Link to={`/scholars/${scholar.slug}`} className="mt-1 text-sm text-ink-600 transition-colors hover:text-accent-dark">
            {authorDisplay}
          </Link>
        ) : (
          <p className="mt-1 text-sm text-ink-600">{authorDisplay}</p>
        )
      )}
      <p className="mt-2 text-sm leading-relaxed text-ink-500 line-clamp-2 flex-1">{book.description}</p>
      <div className="mt-4 pt-3 border-t border-line">
        <Link
          to={`/books/${book.slug}/read`}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-1.5 text-sm font-medium text-ink-900 transition-colors hover:text-accent-dark -mx-1"
        >
          <BookOpen size={14} /> Read
        </Link>
      </div>
    </motion.article>
  );
}
