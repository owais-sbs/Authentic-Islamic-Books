import { classicBook } from '@/data/libraryDemo';
import { ArabicReference } from './ArabicReference';
import { Footnotes } from './Footnotes';
import { DemoBookShell } from './DemoBookShell';

export function ClassicBookReader() {
  const book = classicBook;

  return (
    <DemoBookShell
      number="01"
      formatName={book.formatName}
      title={book.title}
      surface="parchment"
    >
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[200px_minmax(0,1fr)_240px] xl:grid-cols-[220px_minmax(0,1fr)_260px] lg:gap-10 xl:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-5 sm:space-y-6">
          <div
            className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-sm border border-line shadow-md sm:w-44 lg:mx-0 lg:w-full"
            style={{
              background:
                'linear-gradient(165deg, #1A3A2A 0%, #0B1929 55%, #162A42 100%)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-2xl leading-snug text-accent-light"
              >
                {book.coverTitle}
              </p>
              <div className="my-4 h-px w-12 bg-accent/50" />
              <p className="font-cinzel text-[13px] leading-snug tracking-wide text-white/90">
                {book.coverSubtitle}
              </p>
            </div>
          </div>

          <dl className="space-y-3 border-t border-line pt-5 text-sm">
            <MetaRow label="Author" value={book.author} />
            <MetaRow label="Scholar" value={book.scholarInfo} />
            <MetaRow label="Published" value={book.year} />
            <MetaRow label="Category" value={book.category} />
          </dl>
        </aside>

        <article className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
            {book.label}
          </p>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold leading-snug text-ink-900">
            {book.title}
          </h2>
          <p className="mt-2 font-serif text-[15px] text-ink-500">{book.author}</p>

          <p className="mt-8 max-w-prose font-serif text-[15px] leading-relaxed text-ink-600 border-l-2 border-accent/50 pl-4">
            {book.introduction}
          </p>

          <h3 className="mt-12 text-center font-serif text-sm font-semibold uppercase tracking-[0.12em] text-ink-900">
            {book.chapterHeading}
          </h3>
          <div className="mx-auto mt-3 mb-10 h-px w-16 bg-accent" />

          <div className="mx-auto max-w-prose space-y-6 font-serif text-[17px] leading-[1.9] text-ink-800">
            {book.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <h3 className="mt-14 text-center font-serif text-sm font-semibold uppercase tracking-[0.12em] text-ink-900">
            {book.sectionTwoHeading}
          </h3>
          <div className="mx-auto mt-3 mb-10 h-px w-16 bg-accent" />
          <div className="mx-auto max-w-prose space-y-6 font-serif text-[17px] leading-[1.9] text-ink-800">
            {book.sectionTwoParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10 space-y-5 lg:hidden">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Arabic References
            </p>
            {book.arabicRefs.map((ref) => (
              <ArabicReference key={ref.referenceNumber} source={ref} />
            ))}
          </div>

          <div className="mt-12">
            <h4 className="font-serif text-lg font-semibold text-ink-900">References</h4>
            <ol className="mt-4 space-y-3">
              {book.references.map((ref) => (
                <li key={ref.number} className="flex gap-3 font-serif text-[14px] text-ink-700">
                  <span className="shrink-0 font-sans text-[13px] font-semibold text-accent-dark">
                    {ref.number}.
                  </span>
                  <span>{ref.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <Footnotes items={book.footnotes} />
        </article>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            Arabic Sources
          </p>
          {book.arabicRefs.map((ref) => (
            <ArabicReference key={ref.referenceNumber} source={ref} compact />
          ))}
        </aside>
      </div>
    </DemoBookShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-serif text-[13px] leading-snug text-ink-800">{value}</dd>
    </div>
  );
}
