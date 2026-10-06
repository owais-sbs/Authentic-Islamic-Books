import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, BookOpen, Bookmark, X, ChevronDown } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { HijriCenturyMenu } from '@/components/layout/HijriCenturyMenu';
import {
  getSupabasePublishedCache,
  refreshSupabasePublishedCache,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Nav note:
 * - ONLY “Hijri” has a dropdown (century accordion).
 * - “Books” is a plain link to /library — no dropdown.
 */

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Scholars', href: '/scholars' },
  { label: 'Categories', href: '/categories' },
  { label: 'Books', href: '/library' },
];

function useNavBooks() {
  const [books, setBooks] = useState<Book[]>(() =>
    isSupabaseConfigured() ? getSupabasePublishedCache() : getAllImportedBooks()
  );

  useEffect(() => {
    const load = () => {
      if (isSupabaseConfigured()) {
        refreshSupabasePublishedCache()
          .then(setBooks)
          .catch(() => setBooks(getSupabasePublishedCache()));
      } else {
        setBooks(getAllImportedBooks());
      }
    };
    load();
    const handler = () => load();
    window.addEventListener('idl-books-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('idl-books-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return books;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hijriOpen, setHijriOpen] = useState(false);
  const [mobileHijri, setMobileHijri] = useState(false);
  const hijriRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const books = useNavBooks();

  const isHome = location.pathname === '/';
  const onTimeline = location.pathname === '/timeline';

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setHijriOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!hijriOpen) return;
    // Prefetch book detail (and reader) while the menu is open
    void import('@/pages/BookDetailPage');
    void import('@/pages/ReaderPage');
    const onDoc = (e: MouseEvent) => {
      if (hijriRef.current && !hijriRef.current.contains(e.target as Node)) {
        setHijriOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [hijriOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isTransparent = isHome && !scrolled && !searchOpen;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          isTransparent
            ? 'border-b border-transparent bg-transparent'
            : 'border-b border-white/10 bg-ink-900/95 shadow-lg shadow-black/20 backdrop-blur-md'
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 sm:gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-ink-900 shadow-sm transition-transform duration-200 group-hover:scale-[1.04]">
              <BookOpen size={18} strokeWidth={1.5} />
            </div>
            <span className="hidden sm:block font-cinzel text-[13px] font-semibold tracking-wide text-white">
              Islamic Digital Library
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active =
                location.pathname === link.href ||
                (link.href === '/library' && location.pathname.startsWith('/library'));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                    active
                      ? 'text-accent'
                      : isTransparent
                        ? 'text-white/90 hover:text-white'
                        : 'text-white/75 hover:text-white'
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* ONLY Hijri has a dropdown */}
            <div className="relative" ref={hijriRef}>
              <button
                type="button"
                onClick={() => setHijriOpen((v) => !v)}
                className={cn(
                  'relative inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                  hijriOpen || onTimeline
                    ? 'text-accent'
                    : isTransparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-white/75 hover:text-white'
                )}
                aria-expanded={hijriOpen}
                aria-haspopup="true"
              >
                Hijri
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', hijriOpen && 'rotate-180')}
                />
                {(hijriOpen || onTimeline) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {hijriOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-[min(92vw,420px)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_40px_rgba(11,25,41,0.12)]"
                  >
                    <div className="hijri-dropdown-scroll max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain">
                      <HijriCenturyMenu
                        books={books}
                        onNavigate={() => setHijriOpen(false)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-full p-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-accent"
              aria-label="Search"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              to="/bookmarks"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200 hover:bg-accent-light hover:shadow-md"
            >
              <Bookmark size={14} strokeWidth={2.25} />
              Bookmarks
            </Link>

            <Link
              to="/bookmarks"
              className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink-900"
              aria-label="Bookmarks"
            >
              <Bookmark size={16} strokeWidth={2.25} />
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-full p-2.5 text-white transition-colors hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/10 bg-ink-800"
            >
              <div className="container-page py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books, scholars, topics..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-accent/15 text-ink-900' : 'text-ink-600 hover:bg-paper/60'
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileHijri((v) => !v)}
            className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-ink-600 hover:bg-paper/60"
          >
            Hijri
            <ChevronDown size={16} className={mobileHijri ? 'rotate-180' : ''} />
          </button>
          {mobileHijri && (
            <div className="mb-2 overflow-hidden rounded-xl border border-line">
              <div className="hijri-dropdown-scroll max-h-[55vh] overflow-y-auto">
                <HijriCenturyMenu
                  books={books}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          )}

          <Link
            to="/bookmarks"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-ink-900"
          >
            <Bookmark size={16} />
            Bookmarks
          </Link>
        </nav>
      </Drawer>
    </>
  );
}
