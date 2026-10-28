import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X, ChevronDown } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { HijriCenturyMenu } from '@/components/layout/HijriCenturyMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  getSupabasePublishedCache,
  refreshSupabasePublishedCache,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Browse', href: '/library' },
  { label: 'Categories', href: '/categories' },
  { label: 'Authors', href: '/scholars' },
  { label: 'Collections', href: '/library?sort=popular' },
  { label: 'About', href: '/about' },
];

function useNavBooks() {
  const [books, setBooks] = useState<Book[]>(() =>
    isSupabaseConfigured() ? getSupabasePublishedCache() : getAllImportedBooks(),
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
  const onTimeline = location.pathname === '/timeline';

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setHijriOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!hijriOpen) return;
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

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-all duration-300',
          scrolled || searchOpen
            ? 'border-line bg-ivory/95 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-black/95'
            : 'border-line/80 bg-ivory dark:border-white/10 dark:bg-black',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:h-[4.25rem] sm:gap-4">
          <BrandLogo className="min-w-0" />

          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const pathOnly = link.href.split('?')[0];
              const active =
                location.pathname === pathOnly ||
                (pathOnly === '/library' && location.pathname.startsWith('/library'));
              return (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                    'font-sans',
                    active
                      ? 'text-islamic-green dark:text-white'
                      : 'text-ink-600 hover:text-islamic-green dark:text-white/65 dark:hover:text-white',
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

            <div className="relative" ref={hijriRef}>
              <button
                type="button"
                onClick={() => setHijriOpen((v) => !v)}
                className={cn(
                  'relative inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                  hijriOpen || onTimeline
                    ? 'text-islamic-green dark:text-white'
                    : 'text-ink-600 hover:text-islamic-green dark:text-white/65 dark:hover:text-white',
                )}
                aria-expanded={hijriOpen}
                aria-haspopup="true"
              >
                Hijri
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', hijriOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {hijriOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-[min(92vw,420px)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_40px_rgba(16,76,59,0.12)] dark:border-white/10 dark:bg-[#141414]"
                  >
                    <div className="hijri-dropdown-scroll max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain">
                      <HijriCenturyMenu books={books} onNavigate={() => setHijriOpen(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle className="h-9 w-9 sm:h-10 sm:w-10" />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden rounded-full p-2.5 text-ink-600 transition-colors hover:bg-islamic-green/10 hover:text-islamic-green sm:inline-flex dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Search"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              to="/library"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-islamic-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-islamic-forest"
            >
              Start Reading
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-full p-2.5 text-ink-700 transition-colors hover:bg-islamic-green/10 dark:text-white/85 dark:hover:bg-white/10"
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
              className="overflow-hidden border-t border-line bg-white dark:border-white/10 dark:bg-[#141414]"
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
                    className="w-full rounded-xl border border-line bg-ivory py-3 pl-12 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent focus:outline-none dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-white/40"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="mb-1 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-ink-600 hover:bg-paper/60 sm:hidden"
          >
            <Search size={16} />
            Search
          </button>
          {navLinks.map((link) => {
            const pathOnly = link.href.split('?')[0];
            const active = location.pathname === pathOnly;
            return (
              <Link
                key={link.href + link.label}
                to={link.href}
                className={cn(
                  'rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-islamic-green/10 text-islamic-green' : 'text-ink-600 hover:bg-paper/60',
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
                <HijriCenturyMenu books={books} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <Link
            to="/library"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-islamic-green px-4 py-3 text-sm font-semibold text-white"
          >
            Start Reading
          </Link>
        </nav>
      </Drawer>
    </>
  );
}
