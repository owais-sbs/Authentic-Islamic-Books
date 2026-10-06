import { quoteReader } from '@/data/libraryDemo';
import { ScholarQuote } from './ScholarQuote';
import { Footnotes } from './Footnotes';
import { DemoBookShell } from './DemoBookShell';

export function QuoteReader() {
  const data = quoteReader;

  return (
    <DemoBookShell
      number="04"
      formatName={data.formatName}
      title={data.title}
      surface="forest-soft"
    >
      <article className="mx-auto max-w-3xl">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-mid">
          {data.label}
        </p>
        <h3 className="mt-4 font-serif text-3xl sm:text-[2.35rem] font-semibold leading-snug text-ink-900">
          {data.title}
        </h3>
        <p className="mt-3 font-serif text-[15px] text-ink-600">
          {data.author}
          <span className="mx-2 text-line-strong">·</span>
          <span className="italic">{data.scholarNote}</span>
        </p>

        <p className="mt-8 font-serif text-[16px] leading-relaxed text-ink-700 border-l-2 border-forest/30 pl-4">
          {data.introduction}
        </p>

        <p className="mt-8 font-serif text-[17px] leading-[1.9] text-ink-800">
          {data.leadText}
        </p>

        <p className="mt-6 font-serif text-[16px] leading-relaxed text-ink-600 italic">
          {data.midText}
        </p>

        {data.quotes.map((q, i) => {
          if (q.style === 'arabic-primary') {
            return (
              <ScholarQuote
                key={i}
                variant="arabic-primary"
                arabic={q.arabic}
                english={q.translation}
                attribution={q.attribution}
                referenceNumber={q.referenceNumber}
              />
            );
          }
          if (q.style === 'english-emphasis') {
            return (
              <ScholarQuote
                key={i}
                variant="english-emphasis"
                english={q.english}
                attribution={q.attribution}
                referenceNumber={q.referenceNumber}
              />
            );
          }
          return (
            <ScholarQuote
              key={i}
              variant="short-statement"
              english={q.english}
              attribution={q.attribution}
              referenceNumber={q.referenceNumber}
            />
          );
        })}

        <p className="font-serif text-[17px] leading-[1.9] text-ink-800">
          {data.afterQuotes}
        </p>

        {/* Closing Arabic + translation side-by-side on desktop */}
        <div className="mt-12 grid gap-6 border-t border-line pt-10 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Closing Source
            </p>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl sm:text-[1.65rem] leading-[2.1] text-ink-900"
            >
              {data.closingArabic.arabic}
            </p>
          </div>
          <div className="lg:border-l lg:border-line lg:pl-10">
            <p className="font-serif text-lg italic leading-relaxed text-ink-700">
              {data.closingArabic.translation}
            </p>
            <p className="mt-3 font-sans text-[12px] tracking-wide text-accent-dark">
              — {data.closingArabic.attribution} [{data.closingArabic.referenceNumber}]
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h4 className="font-serif text-lg font-semibold text-ink-900">References</h4>
          <ol className="mt-4 space-y-3">
            {data.references.map((ref) => (
              <li key={ref.number} className="flex gap-3 font-serif text-[14px] text-ink-700">
                <span className="shrink-0 font-sans text-[13px] font-semibold text-accent-dark">
                  {ref.number}.
                </span>
                <span>{ref.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <Footnotes items={data.footnotes} />
      </article>
    </DemoBookShell>
  );
}
