import type { ArabicRef } from '@/data/libraryDemo';
import { cn } from '@/lib/utils';

interface ArabicReferenceProps {
  source: ArabicRef;
  className?: string;
  compact?: boolean;
}

/** RTL Arabic source block with English translation and attribution. */
export function ArabicReference({ source, className, compact }: ArabicReferenceProps) {
  return (
    <aside
      className={cn(
        'border-l-2 border-accent/40 bg-accent-subtle/40 pl-4 pr-1 py-3',
        compact ? 'text-sm' : '',
        className
      )}
    >
      {source.referenceNumber && (
        <span className="mb-2 inline-block font-sans text-[11px] font-semibold tracking-wider text-accent-dark">
          [{source.referenceNumber}]
        </span>
      )}
      <p
        dir="rtl"
        lang="ar"
        className={cn(
          'font-arabic text-ink-900 leading-[2.05]',
          compact ? 'text-lg' : 'text-xl sm:text-[1.35rem]'
        )}
      >
        {source.arabic}
      </p>
      <p className="mt-3 font-serif text-[14px] italic leading-relaxed text-ink-600">
        {source.translation}
      </p>
      <p className="mt-2 font-sans text-[12px] tracking-wide text-accent-dark">
        — {source.attribution}
      </p>
    </aside>
  );
}
