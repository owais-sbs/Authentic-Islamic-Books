import { cn } from '@/lib/utils';
import { demoIslamicBook } from '@/data/demoIslamicBook';

interface DemoBookCoverProps {
  className?: string;
  size?: 'card' | 'hero';
}

export function DemoBookCover({ className, size = 'card' }: DemoBookCoverProps) {
  const book = demoIslamicBook;
  const dims =
    size === 'hero'
      ? 'h-[330px] w-[220px] sm:h-[390px] sm:w-[260px] lg:h-[420px] lg:w-[280px]'
      : 'h-[210px] w-[140px] sm:h-[240px] sm:w-[160px]';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl shadow-[0_14px_32px_rgba(16,76,59,0.22)]',
        dims,
        className,
      )}
      role="img"
      aria-label={`${book.titleEn} cover`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.14), transparent 40%), linear-gradient(180deg, ${book.coverColor}, ${book.coverEdge})`,
        }}
      />
      <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/40 to-transparent" />
      <div className="absolute inset-[10px] flex flex-col items-center border border-accent/50 px-3 py-4 text-center text-[#F7F1E4]">
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" aria-hidden />
        <p className="mt-2 font-sans text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
          Demo Edition
        </p>
        <p dir="rtl" lang="ar" className="mt-5 font-arabic text-xl leading-snug sm:text-2xl">
          {book.titleAr}
        </p>
        <p className="mt-3 font-sans text-xs font-semibold leading-snug tracking-wide sm:text-sm">
          {book.titleEn}
        </p>
        <div className="my-3 h-px w-12 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <p className="mt-auto pb-1 font-sans text-[8px] uppercase tracking-[0.12em] text-accent/90">
          {book.author}
        </p>
      </div>
      <div
        className="absolute bottom-[6px] right-0 top-[6px] w-[6px] rounded-r-sm"
        style={{
          background:
            'repeating-linear-gradient(to right, #F3ECDD 0px, #F3ECDD 1px, #D9CFBE 1px, #D9CFBE 2px)',
        }}
        aria-hidden
      />
    </div>
  );
}
