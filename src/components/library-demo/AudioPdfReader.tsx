import { useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import { audioPdfResource } from '@/data/libraryDemo';
import { ArabicReference } from './ArabicReference';
import { Footnotes } from './Footnotes';
import { ResourceLinks } from './ResourceLinks';
import { DemoBookShell } from './DemoBookShell';

/** Demo-only audio player UI — no real media / backend. */
function DemoAudioPlayer({ label, duration }: { label: string; duration: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress] = useState(28); // static visual progress

  return (
    <div className="my-10 overflow-hidden rounded-sm border border-line bg-gradient-to-br from-ink-900 to-ink-800 px-5 py-6 sm:px-8 sm:py-7 text-cream shadow-sm">
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-ink-900 transition-colors hover:bg-accent-light"
          aria-label={playing ? 'Pause demo audio' : 'Play demo audio'}
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Demo playback position"
          >
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-sans text-[11px] tabular-nums text-white/45">
            <span>01:16</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudioPdfReader() {
  const data = audioPdfResource;

  const handleResource = (id: string) => {
    if (id === 'read') {
      document.getElementById('library-demo-resources-anchor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    // view-pdf / download-pdf intentionally non-functional demo placeholders
  };

  return (
    <DemoBookShell
      number="05"
      formatName={data.formatName}
      title={data.title}
      surface="cream"
    >
      <article className="mx-auto max-w-3xl">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-dark">
          {data.label}
        </p>
        <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold leading-snug text-ink-900">
          {data.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-sans text-[13px] text-ink-500">
          <span className="font-medium text-ink-800">{data.author}</span>
          <span className="text-line-strong">·</span>
          <span>{data.category}</span>
        </div>
        <p className="mt-6 font-serif text-[15px] leading-relaxed text-ink-600 italic">
          {data.description}
        </p>

        <div className="mt-8 space-y-5 font-serif text-[17px] leading-[1.9] text-ink-800">
          {data.paragraphsBeforeAudio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <DemoAudioPlayer label={data.audioLabel} duration={data.audioDuration} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10">
          <div className="space-y-5 font-serif text-[17px] leading-[1.9] text-ink-800">
            {data.paragraphsAfterAudio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="lg:pt-1">
            <div className="hidden lg:block">
              <ArabicReference source={data.arabicRef} compact />
            </div>
            <div className="lg:hidden">
              <ArabicReference source={data.arabicRef} />
            </div>
          </div>
        </div>

        <div id="library-demo-resources-anchor">
          <ResourceLinks resources={data.resources} onAction={handleResource} />
        </div>

        {/* References */}
        <div className="mt-12">
          <h4 className="font-serif text-lg font-semibold text-ink-900">References</h4>
          <ol className="mt-4 space-y-3">
            {data.references.map((ref) => (
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

        <Footnotes items={data.footnotes} />

        {/* Related reading */}
        <div className="mt-12 border-t border-line pt-8">
          <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            Related Reading
          </h4>
          <ul className="mt-4 space-y-2">
            {data.relatedReading.map((item) => (
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
    </DemoBookShell>
  );
}
