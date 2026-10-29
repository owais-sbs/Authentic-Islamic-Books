import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import { getDailyBenefit } from '@/data/dailyBenefit';
import { Reveal } from '@/components/motion/Reveal';

/** Daily hadith / benefit card (continue-reading lives above the newsletter). */
export function ContinueDailySection() {
  const benefit = getDailyBenefit();

  return (
    <section className="py-8 sm:py-10">
      <div className="container-page">
        <Reveal>
          <article className="relative mx-auto flex max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-white/92 p-5 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-[#141414] sm:p-8">
            <div className="pointer-events-none absolute -right-6 -top-6 text-accent/15">
              <Quote size={120} strokeWidth={1} />
            </div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              Daily Benefit
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-islamic-green dark:text-white sm:text-3xl">
              Hadith of the Day
            </h2>

            {benefit.arabic && (
              <p
                dir="rtl"
                lang="ar"
                className="mt-6 font-arabic text-xl leading-relaxed text-islamic-green dark:text-accent sm:text-2xl"
              >
                {benefit.arabic}
              </p>
            )}
            <blockquote className="mt-4 flex-1 font-sans text-base leading-relaxed text-ink-800 dark:text-white/85 sm:text-lg">
              “{benefit.english}”
            </blockquote>
            <p className="mt-4 text-sm font-medium text-ink-500 dark:text-white/50">{benefit.reference}</p>
            <Link
              to="/categories"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-islamic-green hover:text-islamic-forest dark:text-accent dark:hover:text-accent-light"
            >
              Explore More <ArrowRight size={14} />
            </Link>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
