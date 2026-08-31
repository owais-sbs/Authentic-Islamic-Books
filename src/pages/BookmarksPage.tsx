import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, ArrowRight, X, Heart } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BookCover } from '@/components/book/BookCover';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSavedBooks } from '@/hooks/useSavedBooks';
import { getBookBySlug } from '@/data/books';

export function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { savedBooks, unsaveBook } = useSavedBooks();

  const groupedByBook: Record<string, typeof bookmarks> = {};
  for (const bookmark of bookmarks) {
    if (!groupedByBook[bookmark.bookSlug]) groupedByBook[bookmark.bookSlug] = [];
    groupedByBook[bookmark.bookSlug].push(bookmark);
  }

  const hasAnything = savedBooks.length > 0 || bookmarks.length > 0;

  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Bookmarks' }]} />

        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">My Bookmarks</h1>
          <p className="mt-2 text-ink-500">
            Saved books and reading sections in one place.
          </p>
        </div>

        {!hasAnything ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-900/5">
              <Bookmark size={28} className="text-ink-300" />
            </div>
            <h3 className="mt-5 font-serif text-lg font-semibold text-ink-900">No bookmarks yet</h3>
            <p className="mt-2 text-sm text-ink-500 max-w-sm">
              Save books from the library or bookmark sections while reading.
            </p>
            <Link
              to="/library"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink-800"
            >
              <BookOpen size={16} /> Explore Library
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {savedBooks.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-ink-900">
                  <Heart size={18} className="text-accent" fill="currentColor" />
                  Saved Books
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedBooks.map((saved) => {
                    const book = getBookBySlug(saved.slug);
                    return (
                      <div
                        key={saved.slug}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-cream p-3 transition-all hover:border-line-strong hover:shadow-sm"
                      >
                        <Link to={`/books/${saved.slug}`} className="shrink-0">
                          {book ? (
                            <BookCover book={book} size="sm" />
                          ) : (
                            <div
                              className="h-28 w-20 rounded-sm"
                              style={{ backgroundColor: saved.coverColor }}
                            />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${saved.slug}`}
                            className="block truncate font-serif text-sm font-semibold text-ink-900 hover:text-accent-dark"
                          >
                            {saved.title}
                          </Link>
                          <Link
                            to={`/books/${saved.slug}/read`}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-accent-dark"
                          >
                            Read <ArrowRight size={10} />
                          </Link>
                        </div>
                        <button
                          onClick={() => unsaveBook(saved.slug)}
                          className="rounded-md p-2 text-ink-400 hover:bg-paper hover:text-red-500"
                          aria-label="Remove saved book"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {bookmarks.length > 0 && (
              <section>
                <h2 className="mb-4 font-serif text-xl font-semibold text-ink-900">
                  Saved Sections
                </h2>
                <div className="space-y-8">
                  {Object.entries(groupedByBook).map(([bookSlug, bookBookmarks]) => {
                    const book = getBookBySlug(bookSlug);
                    if (!book) return null;
                    return (
                      <div key={bookSlug}>
                        <h3 className="mb-4 font-serif text-lg font-semibold text-ink-900">
                          <Link to={`/books/${bookSlug}`} className="transition-colors hover:text-accent-dark">
                            {book.title}
                          </Link>
                        </h3>
                        <div className="space-y-2">
                          {bookBookmarks
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .map((bookmark) => (
                              <div
                                key={`${bookmark.bookSlug}-${bookmark.sectionId}`}
                                className="group flex items-center justify-between rounded-lg border border-line bg-cream p-4 transition-all hover:border-line-strong"
                              >
                                <Link
                                  to={`/books/${bookSlug}/read#${bookmark.sectionId}`}
                                  className="flex items-center gap-3 flex-1 min-w-0"
                                >
                                  <Bookmark size={16} className="shrink-0 text-accent" fill="currentColor" />
                                  <span className="truncate text-sm font-medium text-ink-900">
                                    {bookmark.sectionTitle}
                                  </span>
                                </Link>
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/books/${bookSlug}/read#${bookmark.sectionId}`}
                                    className="text-xs text-ink-500 transition-colors hover:text-accent-dark"
                                  >
                                    Read <ArrowRight size={10} className="inline" />
                                  </Link>
                                  <button
                                    onClick={() => removeBookmark(bookmark.bookSlug, bookmark.sectionId)}
                                    className="rounded-md p-2 text-ink-400 transition-colors hover:bg-paper hover:text-red-500"
                                    aria-label="Remove bookmark"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
