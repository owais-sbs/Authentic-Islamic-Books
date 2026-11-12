import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { label: "The Noble Qur'an", slug: 'quran', emoji: '📖' },
  { label: 'Prophetic Hadith', slug: 'hadith', emoji: '📜' },
  { label: 'Sunnah & Seerah', slug: 'sunnah', emoji: '🧭' },
  { label: 'Islamic History', slug: 'history', emoji: '🏛️' },
];

export function InlineSearchSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/library?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="py-7 sm:py-10 bg-neutral-50 dark:bg-neutral-950/50 border-y border-black/[0.05] dark:border-white/[0.05] transition-colors">
      <div className="container-page">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">
            Find Your Next Read
          </h3>
          <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            Search across the full catalogue of authentic Islamic works
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className={cn(
              'relative flex items-center gap-2 rounded-2xl p-1.5',
              'border border-black/[0.09] dark:border-white/15',
              'bg-white dark:bg-neutral-900/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl',
              'focus-within:ring-2 focus-within:ring-amber-500/40 transition-all',
            )}
          >
            <div className="pl-3 text-neutral-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, scholars, Hadith, Tafsīr..."
              className="flex-1 bg-transparent py-2.5 text-sm font-sans text-ink-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#1B4F72] hover:bg-[#154060] text-white px-5 py-2.5 text-xs font-semibold tracking-wide shadow-sm transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Category quick-links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/library?category=${cat.slug}`)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold',
                  'border border-black/[0.07] dark:border-white/10',
                  'bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'text-ink-800 dark:text-neutral-200 shadow-sm transition-all hover:-translate-y-0.5',
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
