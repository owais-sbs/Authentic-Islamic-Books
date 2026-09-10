import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Library, ArrowRight } from 'lucide-react';
import { getFeaturedBooks } from '@/data/books';
import { BookCover } from '@/components/book/BookCover';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function NotFoundPage() {
  const { pathname } = useLocation();

  const isBookPath = pathname.startsWith('/books/');
  const isAdminPath = pathname.startsWith('/admin');
  const isPublic = !isAdminPath;
  const featured = getFeaturedBooks().slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {isPublic && <Navbar />}

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
            <BookOpen size={32} className="text-accent" />
          </div>

          <h1 className="font-cinzel text-3xl font-semibold text-ink-900 sm:text-4xl">
            {isBookPath ? 'Book Not Found' : 'Page Not Found'}
          </h1>

          <p className="mt-3 max-w-md text-base text-ink-500">
            {isBookPath
              ? `We could not find a book at "${pathname.replace('/books/', '')}". It may have been moved or the link is incorrect.`
              : "The page you are looking for does not exist or may have been moved."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink-900 transition-all hover:bg-accent-light"
            >
              <Library size={16} /> Browse Library
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-accent hover:text-ink-900"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>

        {isPublic && featured.length > 0 && (
          <div className="mt-16 w-full max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-500 uppercase tracking-widest">
                Featured Books
              </p>
              <Link
                to="/library"
                className="flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featured.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-cream p-4 text-left transition-all duration-200 hover:border-accent/50 hover:shadow-md sm:flex-col sm:items-start sm:gap-3"
                >
                  <div className="shrink-0">
                    <BookCover
                      book={book}
                      size="sm"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-semibold leading-snug text-ink-900 line-clamp-2 group-hover:text-accent-dark transition-colors">
                      {book.title}
                    </p>
                    {book.subtitle && (
                      <p className="mt-0.5 text-xs text-ink-400 line-clamp-1">{book.subtitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isPublic && (
          <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-ink-400">
            <Search size={14} />
            Try searching from the
            <Link to="/library" className="font-medium text-accent hover:underline">
              library page
            </Link>
          </p>
        )}

        {isAdminPath && (
          <Link
            to="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#162A42]"
          >
            Back to Admin Dashboard
          </Link>
        )}
      </main>

      {isPublic && <Footer />}
    </div>
  );
}
