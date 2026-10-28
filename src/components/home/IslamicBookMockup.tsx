import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      {/* Spine edge hint */}
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
      {/* Page edge */}
      <div
        className="absolute right-0 top-[6px] bottom-[6px] w-[5px] rounded-r-sm"
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

  if (book.href) {
    return (
      <Link to={book.href} className="block shrink-0 snap-start">
        {body}
      </Link>
    );
  }
  return body;
}

export const FEATURED_MOCK_BOOKS: MockBookSpec[] = [
  {
    id: 'mock-quran',
    title: 'The Noble Qur’an',
    arabic: 'القرآن الكريم',
    author: 'With English Commentary',
    color: '#104C3B',
    pages: 'Complete edition',
    badge: 'Featured',
    href: '/library',
  },
  {
    id: 'mock-bukhari',
    title: 'Sahih al-Bukhari',
    arabic: 'صحيح البخاري',
    author: 'Imam al-Bukhari',
    color: '#5C1F1F',
    pages: 'Hadith collection',
    badge: 'Classic',
    href: '/library?category=hadith',
  },
  {
    id: 'mock-seerah',
    title: 'The Seerah of the Prophet',
    arabic: 'السيرة النبوية',
    author: 'Ibn Kathir',
    color: '#1E3A5F',
    pages: 'Biography',
    badge: 'Classic',
    href: '/library?category=seerah',
  },
  {
    id: 'mock-riyad',
    title: 'Riyad as-Salihin',
    arabic: 'رياض الصالحين',
    author: 'Imam an-Nawawi',
    color: '#347F77',
    pages: 'Hadith & manners',
    badge: 'Ready',
    href: '/library?category=hadith',
  },
  {
    id: 'mock-40',
    title: 'Forty Hadith',
    arabic: 'الأربعون النووية',
    author: 'Imam an-Nawawi',
    color: '#3D2B1F',
    pages: '40 narrations',
    badge: 'Start here',
    href: '/library?category=hadith',
  },
  {
    id: 'mock-aqeedah',
    title: 'Foundations of Faith',
    arabic: 'العقيدة',
    author: 'Classical Collection',
    color: '#0A352A',
    pages: 'Aqeedah',
    badge: 'Ready',
    href: '/library?category=aqeedah',
  },
  {
    id: 'mock-adab',
    title: 'The Book of Manners',
    arabic: 'الآداب',
    author: 'Adab Collection',
    color: '#2B4C3E',
    pages: 'Character',
    badge: 'Featured',
    href: '/library?category=ethics',
  },
];

export const ARRIVAL_MOCK_BOOKS: MockBookSpec[] = [
  {
    id: 'mock-fiqh',
    title: 'Fiqh Essentials',
    arabic: 'الفقه',
    author: 'Introductory Series',
    color: '#2F5D55',
    pages: 'New addition',
    badge: 'New',
    href: '/library?category=fiqh',
  },
  {
    id: 'mock-tazkiyah',
    title: 'Purification of the Heart',
    arabic: 'تزكية',
    author: 'Spiritual Classics',
    color: '#6B3A22',
    pages: 'Tazkiyah',
    badge: 'New',
    href: '/library?category=spirituality',
  },
  {
    id: 'mock-tafsir',
    title: 'Tafsir Reflections',
    arabic: 'تفسير',
    author: 'Qur’an Studies',
    color: '#1A4A3A',
    pages: 'Tafsir',
    badge: 'New',
    href: '/library?category=tafsir',
  },
  {
    id: 'mock-history',
    title: 'Islamic History',
    arabic: 'التاريخ',
    author: 'Civilisation Series',
    color: '#2A1D14',
    pages: 'History',
    badge: 'Ready',
    href: '/library?category=history',
  },
  {
    id: 'mock-character',
    title: 'Family & Character',
    arabic: 'الأخلاق',
    author: 'Ethics Collection',
    color: '#104C3B',
    pages: 'Character',
    badge: 'Ready',
    href: '/library?category=ethics',
  },
  {
    id: 'mock-nawawi-2',
    title: 'Gardens of the Righteous',
    arabic: 'رياض الصالحين',
    author: 'Imam an-Nawawi',
    color: '#1E3A5F',
    pages: 'Hadith',
    badge: 'Classic',
    href: '/library',
  },
  {
    id: 'mock-duas',
    title: 'Daily Supplications',
    arabic: 'الأدعية',
    author: 'Worship Series',
    color: '#3A5A48',
    pages: 'New addition',
    badge: 'New',
    href: '/library',
  },
];

export const START_HERE_MOCK_BOOKS: MockBookSpec[] = [
  FEATURED_MOCK_BOOKS[0],
  FEATURED_MOCK_BOOKS[4],
  FEATURED_MOCK_BOOKS[2],
  ARRIVAL_MOCK_BOOKS[0],
  ARRIVAL_MOCK_BOOKS[1],
  FEATURED_MOCK_BOOKS[5],
  FEATURED_MOCK_BOOKS[6],
];
