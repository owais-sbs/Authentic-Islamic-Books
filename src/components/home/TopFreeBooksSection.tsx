import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import { TOP_FREE_BOOKS, type IslamicMockBook } from '@/data/mockIslamicBooks';

export function TopFreeBooksSection() {
  const books = TOP_FREE_BOOKS;

  // Split into columns of 3 (Apple Books style)
  const column1 = books.slice(0, 3);
  const column2 = books.slice(3, 6);

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-black/60 transition-colors">
      <div className="container-page">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <Link
            to="/library?sort=popular"
            className="group inline-flex items-center gap-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-white"
          >
            <span>Top Free</span>
            <ChevronRight
              size={22}
              className="text-neutral-400 group-hover:text-ink-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/library?sort=popular"
            className="text-xs font-semibold uppercase tracking-wider text-[#1B4F72] hover:text-[#154060] dark:text-blue-400 dark:hover:text-blue-300"
          >
            See All
          </Link>
        </div>

        {/* Apple Books Ranked List: 2-column on desktop, horizontal scroll on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Column 1 (Ranks 1 to 3) */}
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {column1.map((book, idx) => (
              <RankedBookRow key={book.id} book={book} rank={idx + 1} />
            ))}
          </div>

          {/* Column 2 (Ranks 4 to 6) */}
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] hidden md:block">
            {column2.map((book, idx) => (
              <RankedBookRow key={book.id} book={book} rank={idx + 4} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RankedBookRow({ book, rank }: { book: IslamicMockBook; rank: number }) {
  const edge = book.edgeColor ?? '#0A1A12';
  const accent = book.accentColor ?? '#D4B445';

  return (
    <Link
      to={book.href}
      className="group flex items-center gap-4 py-3.5 px-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors"
    >
      {/* 3D Book Thumbnail */}
      <div
        className="relative w-[52px] h-[76px] sm:w-[58px] sm:h-[84px] shrink-0 rounded-md overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-shadow"
        style={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%), linear-gradient(180deg, ${book.color} 0%, ${edge} 100%)`,
        }}
      >
        {/* Book spine line */}
        <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute inset-y-0 left-[3px] w-[0.5px] bg-white/20" />

        {/* Paper stack edge */}
        <div
          className="absolute bottom-1 right-0 top-1 w-[3px]"
          style={{
            background:
              'repeating-linear-gradient(to right, #F5EEE1 0px, #F5EEE1 1px, #DACDB7 1px, #DACDB7 2px)',
          }}
        />

        {/* Miniature cover text */}
        <div
          className="absolute inset-[3px] flex flex-col justify-between items-center text-center p-1 border"
          style={{ borderColor: `${accent}30` }}
        >
          <span className="text-[5px] uppercase tracking-widest text-accent font-sans">
            {book.category.toUpperCase()}
          </span>
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic text-[9px] font-bold text-white leading-none truncate max-w-full"
          >
            {book.arabicTitle}
          </span>
          <span className="text-[5px] text-white/70 line-clamp-1">{book.author.split(' ')[0]}</span>
        </div>
      </div>

      {/* Big Rank Number (Apple Books style) */}
      <span className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white w-6 text-center shrink-0">
        {rank}
      </span>

      {/* Book Metadata */}
      <div className="min-w-0 flex-1">
        <h4 className="font-serif text-base sm:text-lg font-semibold text-ink-900 dark:text-white leading-snug truncate group-hover:text-[#1B4F72] dark:group-hover:text-blue-400 transition-colors">
          {book.title}
        </h4>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
          {book.author}
        </p>
        <div className="flex items-center gap-1.5 mt-1 font-sans text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center text-amber-500">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="ml-0.5 font-semibold text-ink-800 dark:text-neutral-200">
              {book.rating.toFixed(1)}
            </span>
          </span>
          <span>({book.reviewsCount})</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-500 dark:text-neutral-400">{book.categoryLabel}</span>
        </div>
      </div>
    </Link>
  );
}

