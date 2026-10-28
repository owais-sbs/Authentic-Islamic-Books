import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Languages, List } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DemoBookCover, BookTableOfContents } from '@/components/demo-book';
import { demoIslamicBook } from '@/data/demoIslamicBook';
import { usePageMeta } from '@/hooks/usePageMeta';

export function DemoIslamicBookPage() {
  const book = demoIslamicBook;

  usePageMeta({
    title: `${book.titleEn} — Authentic Islamic Books`,
    description: book.description,
    path: `/library/${book.slug}`,
  });

  return (
    <PageContainer>
      <div className="container-page py-5 sm:py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/library' },
            { label: book.titleEn },
          ]}
        />

        <div className="mt-5 grid items-start gap-8 lg:mt-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          {/* Cover — top on mobile, left on desktop */}
          <div className="flex justify-center lg:sticky lg:top-24 lg:justify-start">
            <div className="relative flex justify-center">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl"
                aria-hidden
              />
              <DemoBookCover size="hero" />
            </div>
          </div>

          {/* Details — below cover on mobile, right on desktop */}
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
              {book.status}
            </p>
            <h1 className="mt-2 font-sans text-[1.65rem] font-semibold leading-[1.25] tracking-tight text-ink-900 sm:mt-3 sm:text-4xl">
              {book.titleEn}
            </h1>
            <p
              dir="rtl"
              lang="ar"
              className="mt-2 font-arabic text-xl leading-relaxed text-ink-700 sm:text-2xl"
            >
              {book.titleAr}
            </p>
            <p className="mt-2 font-sans text-sm text-ink-500">by {book.author}</p>

            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink-600 sm:mt-5 sm:text-[15px]">
              {book.description}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 lg:grid-cols-4">
              <Meta label="Language" value={book.language} icon={<Languages size={14} />} />
              <Meta label="Chapters" value={String(book.chapters.length)} icon={<List size={14} />} />
              <Meta
                label="Pages"
                value={String(book.totalPages)}
                icon={<BookOpen size={14} />}
              />
              <Meta label="Type" value={book.contentType} />
            </dl>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to={`/library/${book.slug}/read/1`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-islamic-green px-6 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-islamic-forest sm:w-auto sm:py-3"
              >
                Start Reading
              </Link>
              <a
                href="#contents"
                className="inline-flex w-full items-center justify-center rounded-lg border border-line bg-cream px-6 py-3.5 font-sans text-sm font-semibold text-ink-800 transition-colors hover:border-accent sm:w-auto sm:py-3"
              >
                View Chapters
              </a>
            </div>
          </div>
        </div>

        <div id="contents" className="mt-10 scroll-mt-24 sm:mt-14">
          <BookTableOfContents />
        </div>
      </div>
    </PageContainer>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-cream px-3 py-2.5 sm:py-3">
      <dt className="flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-sans text-[13px] font-medium leading-snug text-ink-800 sm:text-sm">
        {value}
      </dd>
    </div>
  );
}

export default DemoIslamicBookPage;
