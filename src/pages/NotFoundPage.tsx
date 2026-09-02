import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Library, ArrowRight } from 'lucide-react';
import { getFeaturedBooks } from '@/data/books';
import { BookCover } from '@/components/book/BookCover';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function NotFoundPage() {
  const { pathname } = useLocation();

  // Detect if user tried to reach a book path
  const isBookPath   = pathname.startsWith('/books/');
  const isAdminPath  = pathname.startsWith('/admin');

  // Don't show navbar/footer for admin 404s
  const isPublic = !isAdminPath;

  // Grab 3 featured books as suggestions
  const featured = getFeaturedBooks().slice(0, 3);

  const content = (
    <div className="flex min-h-screen flex-col bg-paper">
      {isPublic && <Navbar />}

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-900/5 mb-6">
          <BookOpen size={32} className="text-ink-300" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">
          {isBookPath ? 'Book Not Found' : 'Page Not Found'}
        </h1>

        <p className="mt-3 max-w-md text-base text-ink-500">
          {isBookPath
            ? `We couldn't find a book at "${pathname.replace('/books/', '')}". It may have been moved or the link is incorrect.`
            : "The page you're looking for doesn't exist or may have been moved."}
        </p>

        {/* Primary actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink-800"
          >
            <Library size={16} /> Browse Library
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-ink-400 hover:text-ink-900"
          >
            Back to Home
          </Link>
        </div>

        {/* Suggested books (only for book paths or general 404) */}
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
              {featured.map(book => (
                <Link
                  key={book.id}
                  to={`/books/${book.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-cream p-4 text-left transition-all hover:border-line-strong hover:shadow-sm sm:flex-col sm:items-start sm:gap-3"
                >
                  <div className="shrink-0">
                    <BookCover book={book} size="sm" className="transition-transform duration-300 group-hover:scale-105" />
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

        {/* Search hint */}
        {isPublic && (
          <p className="mt-10 flex items-center gap-2 text-sm text-ink-400">
            <Search size={14} />
            Try searching from the
            <Link to="/library" className="font-medium text-accent hover:underline">library page</Link>
          </p>
        )}

        {/* Admin-specific 404 */}
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

  return content;
}
