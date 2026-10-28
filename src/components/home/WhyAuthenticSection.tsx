import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, SearchCheck, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

const principles = [
  {
    icon: SearchCheck,
    title: 'Careful Source Selection',
    text: 'Books are selected for beneficial knowledge and clear presentation, with preference for works that include references and scholarly context.',
  },
  {
    icon: BookOpenCheck,
    title: 'References That Matter',
    text: 'Where available, Qur’an citations, Hadith references, and bibliographic details are preserved in the reading experience.',
  },
  {
    icon: Sparkles,
    title: 'Knowledge Made Accessible',
    text: 'A calm digital library helps readers discover, search, and study beneficial works without barriers or clutter.',
  },
];

export function WhyAuthenticSection() {
  return (
    <section className="py-14 sm:py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
            Why Authentic Islamic Books
          </p>
          <h2 className="mt-3 font-sans text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl md:text-4xl">
            Knowledge Deserves Careful Sourcing
          </h2>
          <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-ink-500 dark:text-white/65 sm:text-base">
            Discover a reading experience built around clear references, thoughtful curation, and
            accessible Islamic knowledge. We aim for transparency about sources — not marketing
            claims that every work is independently authenticated by us.
          </p>
          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-islamic-green px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#0D3F31]"
          >
            Learn About Our Library <ArrowRight size={15} />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="space-y-4">
            {principles.map((p) => (
              <li
                key={p.title}
                className="flex gap-4 rounded-2xl border border-line bg-white/92 p-5 shadow-soft backdrop-blur-sm transition-transform duration-500 hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#141414]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-islamic-green/10 text-islamic-green dark:bg-accent/15 dark:text-accent">
                  <p.icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-ink-900 dark:text-white">{p.title}</h3>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-500 dark:text-white/60">
                    {p.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
