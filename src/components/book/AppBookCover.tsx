import { Link } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IslamicMockBook } from '@/data/mockIslamicBooks';

interface AppBookCoverProps {
  book: IslamicMockBook;
  size?: 'sm' | 'md' | 'lg' | 'shelf';
  showDetails?: boolean;
  className?: string;
}

export function AppBookCover({
  book,
  size = 'shelf',
  showDetails = true,
  className,
}: AppBookCoverProps) {
  const edge = book.edgeColor ?? '#0A1A12';
  const accent = book.accentColor ?? '#D4B445';

  const dims = {
    sm: 'w-[96px] h-[142px]',
    md: 'w-[124px] h-[184px]',
    shelf: 'w-[140px] sm:w-[158px] aspect-[2/3]',
    lg: 'w-[170px] sm:w-[195px] aspect-[2/3]',
  }[size];

  return (
    <Link
      to={book.href}
      className={cn('group block shrink-0 snap-start select-none focus:outline-none', className)}
    >
      <div className="relative">
        {/* Realistic 3D Book Cover */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl transition-all duration-300 ease-out',
            'shadow-[0_10px_24px_rgba(0,0,0,0.14)] group-hover:-translate-y-2 group-hover:shadow-[0_20px_36px_rgba(0,0,0,0.22)]',
            'border border-black/10 dark:border-white/10',
            dims,
          )}
        >
          {/* Base gradient / leather texture */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 40%), linear-gradient(180deg, ${book.color} 0%, ${edge} 100%)`,
            }}
          />

          {/* Book Spine Crease & Shadow (Left edge) */}
          <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-[7px] w-[1px] bg-white/20 pointer-events-none" />

          {/* Book Pages Stack Texture (Right edge) */}
          <div
            className="absolute bottom-[6px] right-0 top-[6px] w-[6px] rounded-r-[2px] pointer-events-none shadow-inner"
            style={{
              background:
                'repeating-linear-gradient(to right, #F6EFE3 0px, #F6EFE3 1px, #DACDB7 1px, #DACDB7 2px)',
            }}
            aria-hidden
          />

          {/* Golden Islamic Geometric / Arch Frame */}
          <div
            className="absolute inset-[8px] flex flex-col items-center justify-between rounded-lg border px-2.5 py-3 text-center text-[#F9F5EC]"
            style={{ borderColor: `${accent}40` }}
          >
            {/* Top Emblem / Category Tag */}
            <div className="flex flex-col items-center">
              <span
                className="h-1.5 w-1.5 rotate-45"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <span
                className="mt-1 font-sans text-[7px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {book.categoryLabel.split(' ')[0]}
              </span>
            </div>

            {/* Arabic Calligraphy & Title */}
            <div className="my-auto w-full px-1">
              {book.arabicTitle && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-[15px] font-bold leading-tight sm:text-[17px] drop-shadow-sm"
                  style={{ color: '#FFF8E7' }}
                >
                  {book.arabicTitle}
                </p>
              )}
              <h4 className="mt-2 font-serif text-[11px] sm:text-[12px] font-semibold leading-snug tracking-tight text-white/95 line-clamp-2">
                {book.title}
              </h4>
            </div>

            {/* Bottom Author */}
            <div className="w-full">
              <div
                className="mx-auto my-1.5 h-px w-6"
                style={{
                  background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
                }}
              />
              <p
                className="font-sans text-[7.5px] uppercase tracking-[0.12em] line-clamp-1"
                style={{ color: `${accent}E6` }}
              >
                {book.author}
              </p>
            </div>
          </div>

          {/* Badge */}
          {book.badge && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-black/60 backdrop-blur-md px-1.5 py-0.5 font-sans text-[8.5px] font-medium text-white shadow-sm border border-white/10">
              <Check size={9} className="text-accent" strokeWidth={3} />
              {book.badge}
            </span>
          )}
        </div>
      </div>

      {/* Meta below cover */}
      {showDetails && (
        <div className="mt-2.5 max-w-[140px] sm:max-w-[158px]">
          <h4 className="line-clamp-2 font-serif text-[13px] font-semibold leading-snug text-ink-900 group-hover:text-islamic-green dark:text-white dark:group-hover:text-accent">
            {book.title}
          </h4>
          <p className="mt-0.5 line-clamp-1 font-sans text-[11px] text-ink-500 dark:text-white/50">
            {book.author}
          </p>
          <div className="mt-1 flex items-center gap-1 font-sans text-[11px] text-ink-400 dark:text-white/40">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-ink-700 dark:text-white/80">{book.rating.toFixed(1)}</span>
            <span>({book.reviewsCount})</span>
          </div>
        </div>
      )}
    </Link>
  );
}

