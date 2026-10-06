import { numberedRefutation } from '@/data/libraryDemo';
import { ScholarCallout } from './ScholarQuote';
import { Footnotes } from './Footnotes';
import { DemoBookShell } from './DemoBookShell';
import { cn } from '@/lib/utils';

export function NumberedRefutation() {
  const data = numberedRefutation;

  return (
    <DemoBookShell
      number="03"
      formatName={data.formatName}
      title={data.title}
      surface="paper"
    >
      <article className="mx-auto max-w-3xl">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-burgundy">
          {data.label}
        </p>
        <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold leading-snug text-ink-900">
          {data.title}
        </h3>
        <p className="mt-6 font-serif text-[16px] leading-relaxed text-ink-600">
          {data.introduction}
        </p>

        <div className="mt-12 space-y-0">
          {data.blocks.map((block, index) => (
            <div key={block.number}>
              {index > 0 && (
                <div className="my-10 flex items-center gap-4" aria-hidden>
                  <div className="h-px flex-1 bg-burgundy/40" />
                  <div className="h-1.5 w-1.5 rotate-45 bg-burgundy" />
                  <div className="h-px flex-1 bg-burgundy/40" />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
                <div className="sm:pt-1">
                  <span
                    className={cn(
                      'font-cinzel text-4xl sm:text-5xl font-semibold tabular-nums leading-none',
                      block.kind === 'CLAIM' ? 'text-burgundy/80' : 'text-ink-900'
                    )}
                  >
                    {block.number}
                  </span>
                </div>

                <div>
                  <p
                    className={cn(
                      'font-sans text-[11px] font-semibold uppercase tracking-[0.2em]',
                      block.kind === 'CLAIM' ? 'text-burgundy' : 'text-forest-mid'
                    )}
                  >
                    {block.kind}
                  </p>
                  <h4 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink-900">
                    {block.title}
                  </h4>
                  <p className="mt-4 font-serif text-[16.5px] leading-[1.85] text-ink-800">
                    {block.content}
                  </p>
                  {'callout' in block && block.callout && (
                    <ScholarCallout source={block.callout} />
                  )}
                </div>
              </div>
            </div>
          ))}
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
