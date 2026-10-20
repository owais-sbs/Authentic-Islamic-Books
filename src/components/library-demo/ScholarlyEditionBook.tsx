import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { getScholarById } from '@/data/scholars';
import { categories as allCategories } from '@/data/categories';
import { resolveAuthorName } from '@/features/books/components/resolveAuthorName';
import { formatChapterHeading } from '../../lib/chapterTitle';
import type { Book, ContentBlock } from '@/types';

interface ScholarlyEditionBookProps {
  book: Book;
  backHref?: string;
  backLabel?: string;
}

/**
 * Clean production book reader — no Format 06 labels.
 * Structured chapters, RTL Arabic, and proper Qur'an / reference blocks.
 */
export function ScholarlyEditionBook({
  book,
  backHref = '/',
  backLabel = 'Back to Home',
}: ScholarlyEditionBookProps) {
  const scholar = getScholarById(book.authorId);
  const authorName =
    scholar?.name ??
    resolveAuthorName(
      (book as Book & { authorName?: string }).authorName,
      book.authorId,
    );
  const categoryNames = book.categoryIds
    .map((id) => allCategories.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(' · ');

  const introBlocks: ContentBlock[] =
    book.introduction && book.introduction.length > 0
      ? book.introduction
      : [];

  return (
    <div className="min-h-[70vh] bg-parchment">
      <div className="border-b border-line bg-cream/90">
        <div className="container-page py-3.5 sm:py-5">
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-ink-600 transition-colors hover:text-accent-dark"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
          <h1 className="mt-3 font-cinzel text-lg font-semibold leading-snug tracking-wide text-ink-900 sm:text-2xl">
            {book.title}
          </h1>
          {authorName && authorName !== '—' && (
            <p className="mt-1 font-serif text-sm text-ink-500">by {authorName}</p>
          )}
        </div>
      </div>

      <div className="container-page py-8 sm:py-12 lg:py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-8 sm:gap-10 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-sm border border-line shadow-md sm:w-44 lg:mx-0 lg:w-full"
              style={
                book.coverUrl
                  ? undefined
                  : {
                      background:
                        book.coverColor ||
                        'linear-gradient(155deg, #0B1929 0%, #1A3A2A 55%, #C9A84C55 100%)',
                    }
              }
            >
              {book.coverUrl ? (
                <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <p className="line-clamp-5 font-cinzel text-[13px] leading-snug text-white/90">
                    {book.title}
                  </p>
                </div>
              )}
            </div>
            <dl className="space-y-3 border-t border-line pt-5 text-sm">
              {authorName && authorName !== '—' && <Meta label="Author" value={authorName} />}
              {book.publishedYear && <Meta label="Published" value={book.publishedYear} />}
              {categoryNames && <Meta label="Category" value={categoryNames} />}
            </dl>
          </aside>

          <article className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">
              {book.title}
            </h2>
            {book.subtitle && (
              <p className="mt-2 font-serif text-[15px] italic text-ink-500">{book.subtitle}</p>
            )}

            {introBlocks.length > 0 && (
              <div className="mt-6 max-w-prose border-l-2 border-accent/50 pl-4">
                <ContentRenderer blocks={introBlocks} fontSize={16} lineHeight={1.85} />
              </div>
            )}

            {book.chapters.map((chapter) => (
              <section key={chapter.id} id={chapter.id} className="mt-12 scroll-mt-24">
                <h3 className="text-center font-serif text-sm font-semibold uppercase tracking-[0.12em] text-ink-900">
                  {formatChapterHeading(chapter.number, chapter.title)}
                </h3>
                <div className="mx-auto mb-8 mt-3 h-px w-16 bg-accent" />

                {chapter.sections.map((section) => {
                  const sectionHeading = formatChapterHeading(
                    '',
                    section.title === 'Content' ? '' : section.title,
                  );
                  const showSection =
                    section.title &&
                    section.title !== 'Content' &&
                    sectionHeading !== 'Untitled';

                  return (
                    <div key={section.id} id={section.id} className="mb-10 scroll-mt-24">
                      {showSection && (
                        <h4 className="mb-4 font-serif text-lg font-semibold text-ink-900">
                          {section.number ? `${section.number} ` : ''}
                          {sectionHeading}
                        </h4>
                      )}
                      {section.content && section.content.length > 0 && (
                        <div className="mx-auto max-w-prose">
                          <ContentRenderer
                            blocks={section.content}
                            fontSize={17}
                            lineHeight={1.9}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            ))}

            {book.chapters.length === 0 && (
              <p className="mt-10 font-serif text-[15px] text-ink-500">
                This book has no chapters yet.
              </p>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-serif text-[13px] leading-snug text-ink-800">{value}</dd>
    </div>
  );
}
