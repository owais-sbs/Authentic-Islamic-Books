import type { ArabicRef } from '@/data/libraryDemo';
import { cn } from '@/lib/utils';

interface ScholarQuoteProps {
  arabic?: string;
  english?: string;
  attribution: string;
  referenceNumber?: string;
  variant?: 'arabic-primary' | 'english-emphasis' | 'short-statement' | 'inline';
  className?: string;
}

/** Large editorial quotation block for Arabic / English scholarly quotes. */
export function ScholarQuote({
  arabic,
  english,
  attribution,
  referenceNumber,
  variant = 'arabic-primary',
  className,
}: ScholarQuoteProps) {
  if (variant === 'short-statement') {
    return (
      <blockquote
        className={cn(
          'my-10 border-y border-line py-8 text-center',
          className
        )}
      >
        <p className="font-serif text-xl sm:text-2xl font-medium leading-snug text-ink-900">
          “{english}”
        </p>
        <footer className="mt-4 font-sans text-[12px] tracking-wide text-ink-500">
          — {attribution}
          {referenceNumber && (
            <sup className="ml-1 text-accent-dark">[{referenceNumber}]</sup>
          )}
        </footer>
      </blockquote>
    );
  }

  if (variant === 'english-emphasis') {
    return (
      <blockquote
        className={cn(
          'relative my-10 bg-forest-soft/60 px-6 py-8 sm:px-10 sm:py-10',
          className
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-2 font-serif text-6xl leading-none text-forest/20"
        >
          “
        </span>
        <p className="relative font-serif text-lg sm:text-xl leading-relaxed text-ink-800 italic">
          {english}
        </p>
        <footer className="relative mt-5 font-sans text-[12px] tracking-wide text-forest-mid">
          — {attribution}
          {referenceNumber && (
            <sup className="ml-1">[{referenceNumber}]</sup>
          )}
        </footer>
      </blockquote>
    );
  }

  // arabic-primary (default) and inline
  return (
    <blockquote
      className={cn(
        'relative my-10 overflow-hidden bg-parchment px-6 py-8 sm:px-10 sm:py-10',
        'border border-line shadow-[0_1px_0_rgba(11,25,41,0.04)]',
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-1 font-serif text-7xl leading-none text-accent/25"
      >
        ”
      </span>
      {arabic && (
        <p
          dir="rtl"
          lang="ar"
          className="relative font-arabic text-2xl sm:text-[1.75rem] leading-[2.1] text-ink-900"
        >
          {arabic}
        </p>
      )}
      {english && (
        <p className="relative mt-5 max-w-2xl font-serif text-base sm:text-lg leading-relaxed text-ink-700 italic">
          {english}
        </p>
      )}
      <footer className="relative mt-5 flex flex-wrap items-center gap-2 font-sans text-[12px] tracking-wide text-accent-dark">
        <span>— {attribution}</span>
        {referenceNumber && <span className="text-ink-400">[{referenceNumber}]</span>}
      </footer>
    </blockquote>
  );
}

/** Compact callout used inside refutation blocks. */
export function ScholarCallout({ source }: { source: ArabicRef }) {
  return (
    <div className="mt-6 rounded-sm border border-burgundy/20 bg-burgundy-muted/50 px-5 py-5">
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-xl leading-[2.05] text-ink-900"
      >
        {source.arabic}
      </p>
      <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-ink-700">
        {source.translation}
      </p>
      <p className="mt-2 font-sans text-[12px] text-burgundy">
        — {source.attribution}
        {source.referenceNumber && (
          <span className="ml-1 text-ink-400">[{source.referenceNumber}]</span>
        )}
      </p>
    </div>
  );
}
