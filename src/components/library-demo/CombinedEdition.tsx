import { useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import { combinedEdition } from '@/data/libraryDemo';
import { ArabicReference } from './ArabicReference';
import { Footnotes } from './Footnotes';
import { ScholarQuote, ScholarCallout } from './ScholarQuote';
import { ResourceLinks } from './ResourceLinks';
import { DemoBookShell } from './DemoBookShell';
import { cn } from '@/lib/utils';

function DemoAudioPlayer({ label, duration }: { label: string; duration: string }) {
  const [playing, setPlaying] = useState(false);
  const progress = 22;

  return (
    <div className="my-10 overflow-hidden rounded-sm border border-line bg-gradient-to-br from-ink-900 to-ink-800 px-5 py-6 sm:px-8 text-cream">
      <div className="flex items-center gap-2 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-accent-light">
        <Headphones size={14} />
        {label}
      </div>
      <p className="mt-2 font-serif text-sm text-white/55">
        Demonstration player — not connected to audio storage.
      </p>
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-ink-900 hover:bg-accent-light"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between font-sans text-[11px] tabular-nums text-white/45">
            <span>01:22</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCited(text: string) {
  return text.split(/(\[\d+\])/g).map((part, i) => {
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

/** Format 06 — combines book reader + research + refutation + quotes + audio/PDF. */
export function CombinedEdition() {
  const book = combinedEdition;

  return (
    <DemoBookShell
      number="06"
      formatName={book.formatName}
      title={book.title}
      surface="parchment"
    >
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[200px_minmax(0,1fr)_240px] xl:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-5 sm:space-y-6">
          <div
            className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-sm border border-line shadow-md sm:w-44 lg:mx-0 lg:w-full"
            style={{
              background:
                'linear-gradient(155deg, #0B1929 0%, #1A3A2A 35%, #8B2E2E 70%, #C9A84C55 100%)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <p dir="rtl" lang="ar" className="font-arabic text-2xl text-accent-light">
                {book.coverTitle}
              </p>
              <div className="my-4 h-px w-12 bg-accent/50" />
              <p className="font-cinzel text-[13px] text-white/90">{book.coverSubtitle}</p>
            </div>
          </div>
          <dl className="space-y-3 border-t border-line pt-5 text-sm">
            <Meta label="Author" value={book.author} />
            <Meta label="Scholar" value={book.scholarInfo} />
            <Meta label="Published" value={book.year} />
            <Meta label="Category" value={book.category} />
          </dl>
        </aside>

        <article className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
            {book.label}
          </p>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-ink-900">
            {book.title}
          </h2>
          <p className="mt-2 font-serif text-[15px] italic text-ink-500">{book.subtitle}</p>
          <p className="mt-6 max-w-prose border-l-2 border-accent/50 pl-4 font-serif text-[15px] leading-relaxed text-ink-600">
            {book.introduction}
          </p>

          {/* Part I — book prose */}
          <h3 className="mt-12 text-center font-serif text-sm font-semibold uppercase tracking-[0.12em] text-ink-900">
            {book.chapterHeading}
          </h3>
          <div className="mx-auto mt-3 mb-8 h-px w-16 bg-accent" />
          <div className="mx-auto max-w-prose space-y-5 font-serif text-[17px] leading-[1.9] text-ink-800">
            {book.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Part II — research + drop cap */}
          <h3 className="mt-14 font-serif text-xl font-semibold text-ink-900 border-b border-line pb-2">
            {book.researchHeading}
          </h3>
          <p className="library-dropcap mt-6 max-w-prose font-serif text-[17px] leading-[1.9] text-ink-800">
            <span className="library-dropcap-letter" aria-hidden>
              A
            </span>
            {book.researchLead}
          </p>
          <div className="mt-5 max-w-prose space-y-5 font-serif text-[17px] leading-[1.9] text-ink-800">
            {book.researchParagraphs.map((p, i) => (
              <p key={i}>{renderCited(p)}</p>
            ))}
          </div>

          {/* Part III — numbered refutation */}
          <p className="mt-14 font-serif text-[16px] leading-relaxed text-ink-600">
            {book.refutationIntro}
          </p>
          <div className="mt-8 space-y-0">
            {book.blocks.map((block, index) => (
              <div key={block.number}>
                {index > 0 && (
                  <div className="my-8 flex items-center gap-4" aria-hidden>
                    <div className="h-px flex-1 bg-burgundy/40" />
                    <div className="h-1.5 w-1.5 rotate-45 bg-burgundy" />
                    <div className="h-px flex-1 bg-burgundy/40" />
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)]">
                  <span
                    className={cn(
                      'font-cinzel text-4xl font-semibold',
                      block.kind === 'CLAIM' ? 'text-burgundy/80' : 'text-ink-900'
                    )}
                  >
                    {block.number}
                  </span>
                  <div>
                    <p
                      className={cn(
                        'font-sans text-[11px] font-semibold uppercase tracking-[0.2em]',
                        block.kind === 'CLAIM' ? 'text-burgundy' : 'text-forest-mid'
                      )}
                    >
                      {block.kind}
                    </p>
                    <h4 className="mt-2 font-serif text-lg font-semibold text-ink-900">
                      {block.title}
                    </h4>
                    <p className="mt-3 font-serif text-[16px] leading-[1.85] text-ink-800">
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

          {/* Part IV — quotes */}
          <p className="mt-14 font-serif text-[16px] text-ink-600">{book.quoteIntro}</p>
          {book.quotes.map((q, i) => (
            <ScholarQuote
              key={i}
              variant={q.style}
              arabic={'arabic' in q ? q.arabic : undefined}
              english={'english' in q ? q.english : 'translation' in q ? q.translation : undefined}
              attribution={q.attribution}
              referenceNumber={q.referenceNumber}
            />
          ))}

          {/* Part V — audio + resources */}
          <p className="mt-6 font-serif text-[16px] text-ink-600">{book.audioIntro}</p>
          <DemoAudioPlayer label={book.audioLabel} duration={book.audioDuration} />
          <div className="space-y-5 font-serif text-[17px] leading-[1.9] text-ink-800">
            {book.paragraphsAfterAudio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-6 space-y-5 lg:hidden">
            {book.arabicRefs.map((ref) => (
              <ArabicReference key={ref.referenceNumber} source={ref} />
            ))}
          </div>

          <ResourceLinks resources={book.resources} />

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

          <div className="mt-12 border-t border-line pt-8">
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
              Related Reading
            </h4>
            <ul className="mt-4 space-y-2">
              {book.relatedReading.map((item) => (
                <li
                  key={item}
                  className="font-serif text-[15px] text-ink-700 before:mr-2 before:text-accent before:content-['▸']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-serif text-[13px] leading-snug text-ink-800">{value}</dd>
    </div>
  );
}
