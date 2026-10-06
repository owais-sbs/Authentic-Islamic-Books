import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { DemoCatalogItem } from '@/data/libraryDemo';
import { DemoBookMockup } from './DemoBookMockup';

interface DemoBookCardProps {
  book: DemoCatalogItem;
}

export function DemoBookCard({ book }: DemoBookCardProps) {
  return (
    <Link
      to={`/library/${book.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-cream shadow-[0_2px_12px_rgba(11,25,41,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_12px_28px_rgba(11,25,41,0.08)]"
    >
      <div className="relative aspect-[5/3.6] w-full shrink-0 overflow-hidden border-b border-line">
        <DemoBookMockup book={book} />
      </div>

      <div className="flex flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
        <p className="font-sans text-[10px] font-semibold tracking-[0.14em] text-ink-400 sm:text-[11px] sm:tracking-[0.16em]">
          BOOK {book.number} · {book.formatName}
        </p>
        <h3 className="mt-2 font-serif text-base font-semibold leading-snug text-ink-900 sm:text-lg">
          {book.title}
        </h3>
        <p className="mt-1.5 font-sans text-[12px] text-ink-500 sm:text-[13px]">{book.author}</p>
        <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-accent-dark sm:text-[11px]">
          {book.category}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 font-serif text-[13px] leading-relaxed text-ink-600 sm:mt-4 sm:text-[14px]">
          {book.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
          {book.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded-md border border-line bg-parchment px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide text-ink-600"
            >
              {f}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-ink-900 transition-colors group-hover:text-accent-dark sm:mt-6">
          Open this format
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
