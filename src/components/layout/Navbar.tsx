import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, BookOpen } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Scholars', href: '/scholars' },
  { label: 'Categories', href: '/categories' },
  { label: 'Timeline', href: '/timeline' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // on homepage, check immediately in case page loads scrolled
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // On homepage: transparent when at top, solid when scrolled
  // On all other pages: always solid
  const isTransparent = isHome && !scrolled && !searchOpen;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isTransparent
            ? 'border-b border-transparent bg-transparent'
            : scrolled
            ? 'border-b border-white/10 bg-ink-900/95 backdrop-blur-md'
            : 'border-b border-transparent bg-ink-900'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-ink-900">
              <BookOpen size={18} strokeWidth={1.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold tracking-tight text-white">Islamic Digital Library</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'text-accent bg-white/10'
                      : isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-ink-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-md p-2 transition-colors ${
                isTransparent
                  ? 'text-white/70 hover:text-accent hover:bg-white/10'
                  : 'text-ink-300 hover:bg-white/10 hover:text-accent'
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link
              to="/bookmarks"
              className={`hidden sm:block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-ink-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              Bookmarks
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden rounded-md p-2.5 transition-colors ${
                isTransparent ? 'text-white/70 hover:bg-white/10' : 'text-ink-300 hover:bg-white/10'
              }`}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Inline search dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'bg-paper text-ink-900' : 'text-ink-600 hover:bg-paper/60'
            }`}
          >
            Home
          </Link>
          {navLinks.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-paper text-ink-900' : 'text-ink-600 hover:bg-paper/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/bookmarks"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-paper/60"
          >
            Bookmarks
          </Link>
        </nav>
      </Drawer>
    </>
  );
}
