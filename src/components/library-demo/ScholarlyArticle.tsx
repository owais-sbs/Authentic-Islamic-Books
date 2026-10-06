import { scholarlyArticle } from '@/data/libraryDemo';
import { ArabicReference } from './ArabicReference';
import { DemoBookShell } from './DemoBookShell';

export function ScholarlyArticle() {
  const article = scholarlyArticle;

  return (
    <DemoBookShell
      number="02"
      formatName={article.formatName}
      title={article.title}
      surface="cream"
    >
      <article className="mx-auto max-w-4xl">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
          {article.label}
        </p>
        <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-semibold leading-[1.2] text-ink-900">
          {article.title}
        </h3>

        {/* Metadata row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line pb-5 font-sans text-[13px] text-ink-500">
          <span className="font-medium text-ink-800">{article.author}</span>
          <span className="text-line-strong" aria-hidden>
            |
          </span>
          <span>{article.date}</span>
          <span className="text-line-strong" aria-hidden>
            |
          </span>
          <span>{article.category}</span>
          <span className="text-line-strong" aria-hidden>
            |
          </span>
          <span>{article.readingTime}</span>
        </div>

        <p className="mt-8 max-w-prose font-serif text-[15px] leading-relaxed text-ink-600 italic">
          {article.introduction}
        </p>

        {/* Drop-cap lead */}
        <p className="library-dropcap mt-10 max-w-prose font-serif text-[17px] leading-[1.9] text-ink-800">
          <span className="library-dropcap-letter" aria-hidden>
            A
          </span>
          {article.leadParagraph}
        </p>

        {article.sections.map((section) => (
          <div key={section.heading} className="mt-12">
            <div
              className={
                section.arabicRef
                  ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10'
                  : ''
              }
            >
              <div>
                <h4 className="font-serif text-xl font-semibold text-ink-900 border-b border-line pb-2">
                  {section.heading}
                </h4>
                <div className="mt-5 space-y-5 max-w-prose font-serif text-[17px] leading-[1.9] text-ink-800">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="library-cite-nums">
                      {renderCitedParagraph(p)}
                    </p>
                  ))}
                </div>
              </div>

              {section.arabicRef && (
                <>
                  <div className="hidden lg:block lg:pt-10">
                    <ArabicReference source={section.arabicRef} compact />
                  </div>
                  <div className="lg:hidden">
                    <ArabicReference source={section.arabicRef} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* References */}
        <div className="mt-14 border-t border-ink-900/10 pt-8">
          <h4 className="font-serif text-lg font-semibold text-ink-900">References</h4>
          <ol className="mt-5 space-y-3">
            {article.references.map((ref) => (
              <li
                key={ref.number}
                className="flex gap-3 font-serif text-[14px] leading-relaxed text-ink-700"
              >
                <span className="shrink-0 font-sans text-[13px] font-semibold text-accent-dark">
                  {ref.number}.
                </span>
                <span>{ref.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </DemoBookShell>
  );
}

/** Turn trailing [n] markers into styled superscripts. */
function renderCitedParagraph(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      return (
        <sup key={i} className="ml-0.5 font-sans text-[11px] font-semibold text-accent-dark">
          [{m[1]}]
        </sup>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
