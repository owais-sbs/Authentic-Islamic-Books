import type { Book } from '@/types';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  variant?: 'grid' | 'list';
}

export function BookGrid({ books, variant = 'grid' }: BookGridProps) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {books.map((book, i) => (
          <BookCard key={book.id} book={book} variant="list" index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book, i) => (
        <BookCard key={book.id} book={book} index={i} />
      ))}
    </div>
  );
}
