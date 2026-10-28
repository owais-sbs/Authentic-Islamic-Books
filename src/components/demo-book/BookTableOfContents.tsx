import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { demoIslamicBook } from '@/data/demoIslamicBook';

interface BookTableOfContentsProps {
  baseReadPath?: string;
}

export function BookTableOfContents({
  baseReadPath = `/library/${demoIslamicBook.slug}/read`,
}: BookTableOfContentsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-cream">
      <div className="border-b border-line px-4 py-3 sm:px-5">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
          Table of Contents
        </h2>
      </div>
      <ul className="divide-y divide-line">
        {demoIslamicBook.chapters.map((ch) => {
          const pageCount = ch.endPage - ch.startPage + 1;
          return (
            <li key={ch.id}>
              <Link
                to={`${baseReadPath}/${ch.startPage}`}
                className="group flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-paper sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
                    Chapter {String(ch.number).padStart(2, '0')}
                  </p>
                  <p className="mt-1 font-sans text-base font-semibold text-ink-900 group-hover:text-islamic-green">
                    {ch.titleEn}
                  </p>
                  <p dir="rtl" lang="ar" className="mt-0.5 font-arabic text-sm text-ink-500">
                    {ch.titleAr}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-sans text-xs text-ink-500">
                      Pages {ch.startPage}–{ch.endPage}
                    </p>
                    <p className="font-sans text-[11px] text-ink-400">
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-700 transition-colors group-hover:border-accent group-hover:text-accent-dark">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
