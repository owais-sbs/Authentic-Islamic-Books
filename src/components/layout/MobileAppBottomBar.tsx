import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Compass, Search, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_MOCK_BOOKS } from '@/data/mockIslamicBooks';

export function MobileAppBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Close search when path changes
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const currentPath = location.pathname;

  const isHome = currentPath === '/';
  const isLibrary = currentPath.startsWith('/library');
  const isCategories = currentPath.startsWith('/categories') || currentPath.startsWith('/timeline');

  const filteredBooks = query.trim()
    ? ALL_MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase()) ||
          b.arabicTitle.includes(query),
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/library?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Floating Frosted Glass Bottom Dock (Mobile Only) */}
      <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none lg:hidden">
        <nav
          aria-label="Mobile Navigation"
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-1 px-3 py-2.5',
            'w-full max-w-[380px] rounded-full',
            'backdrop-blur-2xl bg-white/90 dark:bg-[#181818]/95',
            'border border-black/[0.08] dark:border-white/12',
            'shadow-[0_12px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)]',
            'transition-transform duration-300 ease-out',
          )}
        >
          {/* Home Tab */}
          <Link
            to="/"
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center py-1 px-1 transition-all duration-200',
              isHome && !searchOpen
                ? 'text-[#1B4F72] dark:text-blue-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
            )}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              {isHome && !searchOpen && (
                <motion.span
                  layoutId="mobile-nav-circle"
                  className="absolute inset-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Home
                size={17}
                strokeWidth={isHome && !searchOpen ? 2.4 : 1.8}
                className={cn('relative z-10 transition-colors', isHome && !searchOpen ? 'text-white' : '')}
              />
            </div>
            <span className="relative z-10 mt-1.5 text-[10px] tracking-tight leading-none">Home</span>
          </Link>

          {/* Library Tab */}
          <Link
            to="/library"
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center py-1 px-1 transition-all duration-200',
              isLibrary && !searchOpen
                ? 'text-[#1B4F72] dark:text-blue-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
            )}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              {isLibrary && !searchOpen && (
                <motion.span
                  layoutId="mobile-nav-circle"
                  className="absolute inset-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <BookOpen
                size={17}
                strokeWidth={isLibrary && !searchOpen ? 2.4 : 1.8}
                className={cn('relative z-10 transition-colors', isLibrary && !searchOpen ? 'text-white' : '')}
              />
            </div>
            <span className="relative z-10 mt-1.5 text-[10px] tracking-tight leading-none">Library</span>
          </Link>

          {/* Discover Tab */}
          <Link
            to="/categories"
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center py-1 px-1 transition-all duration-200',
              isCategories && !searchOpen
                ? 'text-[#1B4F72] dark:text-blue-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
            )}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              {isCategories && !searchOpen && (
                <motion.span
                  layoutId="mobile-nav-circle"
                  className="absolute inset-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Compass
                size={17}
                strokeWidth={isCategories && !searchOpen ? 2.4 : 1.8}
                className={cn('relative z-10 transition-colors', isCategories && !searchOpen ? 'text-white' : '')}
              />
            </div>
            <span className="relative z-10 mt-1.5 text-[10px] tracking-tight leading-none">Discover</span>
          </Link>

          {/* Search Tab (Interactive) */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center py-1 px-1 transition-all duration-200',
              searchOpen
                ? 'text-[#1B4F72] dark:text-blue-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
            )}
            aria-label="Open Search"
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              {searchOpen && (
                <motion.span
                  layoutId="mobile-nav-circle"
                  className="absolute inset-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Search
                size={17}
                strokeWidth={searchOpen ? 2.4 : 1.8}
                className={cn('relative z-10 transition-colors', searchOpen ? 'text-white' : '')}
              />
            </div>
            <span className="relative z-10 mt-1.5 text-[10px] tracking-tight leading-none">Search</span>
          </button>
        </nav>
      </div>

      {/* Instant Mobile Search Sheet / Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full rounded-t-3xl border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-2xl p-5 pb-28 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-white">
                  Search Library
                </h3>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titles, scholars, Qur'an, Hadith..."
                  className="w-full rounded-2xl border border-black/[0.08] dark:border-white/10 bg-neutral-100 dark:bg-neutral-800/80 py-3 pl-10 pr-4 text-sm font-sans text-ink-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
                />
              </form>

              {/* Instant Suggestions */}
              {query.trim() && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Matches
                  </p>
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((b) => (
                      <Link
                        key={b.id}
                        to={b.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-serif text-sm font-semibold text-ink-900 dark:text-white truncate">
                            {b.title}
                          </p>
                          <p className="font-sans text-xs text-neutral-500 truncate">{b.author}</p>
                        </div>
                        <ArrowRight size={14} className="text-neutral-400 shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 py-3 text-center">
                      No direct match. Press search to browse the full library.
                    </p>
                  )}
                </div>
              )}

              {/* Quick Category Chips */}
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Browse by Discipline
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "The Noble Qur'an", slug: 'quran' },
                    { label: 'Prophetic Hadith', slug: 'hadith' },
                    { label: 'Sunnah & Seerah', slug: 'sunnah' },
                    { label: 'Islamic History', slug: 'history' },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        navigate(`/library?category=${cat.slug}`);
                        setSearchOpen(false);
                      }}
                      className="rounded-full border border-black/[0.08] dark:border-white/10 bg-white/60 dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-ink-800 dark:text-white hover:border-amber-500 transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

