import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Languages } from 'lucide-react';
import { demoIslamicBook } from '@/data/demoIslamicBook';
import { DemoBookCover } from './DemoBookCover';

export function DemoBookLibraryCard() {
  const book = demoIslamicBook;

  return (
    <Link
      to={`/library/${book.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-cream shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-book"
    >
      <div className="flex justify-center border-b border-line bg-gradient-to-b from-[#F7F3EA] to-ivory px-4 py-6 dark:from-[#141414] dark:to-black">
        <DemoBookCover />
      </div>
      <div className="flex flex-1 flex-col px-4 py-5 sm:px-5">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-dark">
          Kutub-style reader · Demo
        </p>
        <h3 className="mt-2 font-sans text-base font-semibold leading-snug text-ink-900 sm:text-lg">
          {book.titleEn}
        </h3>
        <p dir="rtl" lang="ar" className="mt-1 font-arabic text-sm text-ink-600">
          {book.titleAr}
        </p>
        <p className="mt-2 font-sans text-xs text-ink-500">{book.author}</p>
        <p className="mt-3 line-clamp-3 flex-1 font-sans text-[13px] leading-relaxed text-ink-600">
          {book.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-600">
            <Languages size={11} /> {book.language}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-600">
            <BookOpen size={11} /> {book.chapters.length} chapters · {book.totalPages} pages
          </span>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-islamic-green group-hover:text-accent-dark">
          Explore Book <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
