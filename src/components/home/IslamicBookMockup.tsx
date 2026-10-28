import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEMO_BOOK_SLUG } from '@/data/demoIslamicBook';

export interface MockBookSpec {
  id: string;
  title: string;
  arabic?: string;
  author: string;
  color: string;
  edge?: string;
  href?: string;
  pages?: string;
  badge?: string;
}

const DEMO_HREF = `/library/${DEMO_BOOK_SLUG}`;

/** Clean front-facing cover — matches professional library carousel layouts. */
export function IslamicBookMockup({
  book,
  className,
  showMeta = true,
  size = 'shelf',
}: {
  book: MockBookSpec;
  className?: string;
  showMeta?: boolean;
  size?: 'shelf' | 'path';
}) {
  const edge = book.edge ?? '#0A1A12';
  const dims =
    size === 'path'
      ? 'w-[92px] sm:w-[100px]'
      : 'w-[148px] sm:w-[164px]';

  const cover = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl shadow-[0_12px_28px_rgba(16,76,59,0.18)] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_36px_rgba(16,76,59,0.26)]',
        dims,
      )}
      style={{ aspectRatio: '2 / 3' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.12), transparent 38%), linear-gradient(180deg, ${book.color}, ${edge})`,
        }}
      />
      <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/35 to-transparent" />
      <div className="absolute inset-[9px] flex flex-col items-center border border-accent/40 px-2 py-3 text-center text-[#F7F1E4]">
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" aria-hidden />
        <p className="mt-2 font-sans text-[7px] font-semibold uppercase tracking-[0.18em] text-accent">
          Authentic
        </p>
        {book.arabic && (
          <p dir="rtl" lang="ar" className="mt-3 font-arabic text-[15px] leading-snug sm:text-[16px]">
            {book.arabic}
          </p>
        )}
        <p className="mt-2 font-sans text-[10px] font-semibold leading-snug tracking-wide">
          {book.title}
        </p>
        <div className="my-2 h-px w-8 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <p className="mt-auto font-sans text-[7px] uppercase tracking-[0.1em] text-accent/90">
          {book.author}
        </p>
      </div>
      <div
        className="absolute bottom-[6px] right-0 top-[6px] w-[5px] rounded-r-sm"
        style={{
          background:
            'repeating-linear-gradient(to right, #F3ECDD 0px, #F3ECDD 1px, #D9CFBE 1px, #D9CFBE 2px)',
        }}
        aria-hidden
      />
      {(book.badge || book.pages) && (
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-islamic-green px-2 py-0.5 font-sans text-[10px] font-semibold text-white shadow-sm">
          <Check size={10} strokeWidth={3} />
          {book.badge ?? 'Ready'}
        </span>
      )}
    </div>
  );

  const meta = showMeta && (
    <div className={cn('mt-3', dims)}>
      <h4 className="line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-ink-900 group-hover:text-islamic-green dark:text-white dark:group-hover:text-accent sm:text-sm">
        {book.title}
      </h4>
      <p className="mt-1 line-clamp-1 font-sans text-xs text-ink-500 dark:text-white/55">
        {book.author}
      </p>
      {book.pages && (
        <p className="mt-1 font-sans text-[11px] font-medium text-accent-dark">{book.pages}</p>
      )}
    </div>
  );

  const body = (
    <div className={cn('group shrink-0', className)}>
      {cover}
      {meta}
    </div>
  );

  // All homepage mock shelves open the Kutub-style demo reading experience
  return (
    <Link to={book.href ?? DEMO_HREF} className="block shrink-0 snap-start">
      {body}
    </Link>
  );
}

export const FEATURED_MOCK_BOOKS: MockBookSpec[] = [
  {
    id: 'mock-quran',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#104C3B',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-bukhari',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#5C1F1F',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-seerah',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#1E3A5F',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-riyad',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#347F77',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-40',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#3D2B1F',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-aqeedah',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#0A352A',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-adab',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#2B4C3E',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
];

export const ARRIVAL_MOCK_BOOKS: MockBookSpec[] = [
  {
    id: 'mock-fiqh',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#2F5D55',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-tazkiyah',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#6B3A22',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-tafsir',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#1A4A3A',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-history',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#2A1D14',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-character',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#104C3B',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-nawawi-2',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#1E3A5F',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
  {
    id: 'mock-duas',
    title: 'Foundations of Islamic Knowledge',
    arabic: 'أصول العلم الإسلامي',
    author: 'Abdullah Ahmad (demo)',
    color: '#3A5A48',
    pages: '10 pages · 3 chapters',
    badge: 'Demo',
    href: DEMO_HREF,
  },
];

export const START_HERE_MOCK_BOOKS: MockBookSpec[] = [
  FEATURED_MOCK_BOOKS[0],
  FEATURED_MOCK_BOOKS[1],
  FEATURED_MOCK_BOOKS[2],
  ARRIVAL_MOCK_BOOKS[0],
  ARRIVAL_MOCK_BOOKS[1],
  FEATURED_MOCK_BOOKS[3],
  FEATURED_MOCK_BOOKS[4],
];
