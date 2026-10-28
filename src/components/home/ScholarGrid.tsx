import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Scholar } from '@/types';
import { Reveal } from '@/components/motion/Reveal';

interface ScholarGridProps {
  scholars: Scholar[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ScholarGrid({ scholars }: ScholarGridProps) {
  const list = scholars.slice(0, 6);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const play = () => {
      void v.play().catch(() => {});
    };
    play();
    const onVis = () => {
      if (document.visibilityState === 'visible') play();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section className="relative overflow-hidden py-8 sm:py-10">
      {/* Autoplay background video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/brand/hero-books.jpg"
          aria-hidden
        >
          <source src="/scholars%20bg.mp4" type="video/mp4" />
        </video>
        {/* Soft overlay so video stays visible but readable */}
        <div className="absolute inset-0 bg-white/45 dark:bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/50 via-transparent to-ivory/55 dark:from-black/50 dark:to-black/60" />
      </div>

      <div className="container-page relative z-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-[1.35] tracking-tight text-ink-900 dark:text-white sm:text-4xl sm:leading-[1.32]">
            Learn From Trusted Scholars and Authors All Around the World
          </h2>
          <p className="mt-5 font-sans leading-relaxed text-ink-600 dark:text-white/65">
            Explore beneficial works from scholars, authors, and contributors represented in our
            collection — across eras, regions, and traditions.
          </p>
        </Reveal>

        {list.length === 0 ? (
          <p className="mt-10 text-center font-sans text-sm text-ink-500">
            Scholar profiles will appear here as they are added to the library.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((scholar, i) => (
              <Reveal key={scholar.id} delay={(i % 3) * 0.05}>
                <article className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 dark:border-white/10 dark:bg-[#141414]/95">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-accent/45 bg-ivory font-sans text-sm font-bold text-islamic-green dark:bg-black dark:text-accent"
                      aria-hidden
                    >
                      {initials(scholar.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-sans text-lg font-bold tracking-tight text-ink-900">
                        {scholar.name}
                      </h3>
                      <p className="mt-0.5 font-sans text-xs text-ink-500">
                        {scholar.bornHijri}–{scholar.diedHijri} AH
                        {scholar.bornPlace ? ` · ${scholar.bornPlace}` : ''}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-ink-500">
                    {scholar.shortBio}
                  </p>
                  <Link
                    to={`/scholars/${scholar.slug || scholar.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-islamic-green hover:text-accent-dark"
                  >
                    View Books <ArrowRight size={14} />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/scholars"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/95 px-5 py-2.5 font-sans text-sm font-semibold text-ink-900 shadow-sm transition-colors hover:border-islamic-green hover:text-islamic-green"
          >
            Browse All Scholars <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
