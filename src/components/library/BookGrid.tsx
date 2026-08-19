import { motion } from 'framer-motion';
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
        {books.map((book) => (
          <BookCard key={book.id} book={book} variant="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export function BookGridAnimated({ books, variant = 'grid' }: BookGridProps) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
          >
            <BookCard book={book} variant="list" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book, i) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
        >
          <BookCard book={book} />
        </motion.div>
      ))}
    </div>
  );
}
