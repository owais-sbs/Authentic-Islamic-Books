import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Quote } from 'lucide-react';
import type { Book } from '@/types';
import { BookCover } from '@/components/book/BookCover';
import { getDailyBenefit } from '@/data/dailyBenefit';
import { Reveal } from '@/components/motion/Reveal';

interface ContinueDailySectionProps {
  continueBook: Book | null;
  progressHint?: string;
}

export function ContinueDailySection({ continueBook, progressHint }: ContinueDailySectionProps) {
  const benefit = getDailyBenefit();

  return (
    <section className="py-8 sm:py-10">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <Reveal>
          <article className="flex h-full flex-col rounded-2xl border border-line bg-white/92 p-5 shadow-soft backdrop-blur-sm transition-transform duration-500 hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#141414] sm:p-7">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              Your Reading
            </p>
            <h2 className="mt-2 font-sans text-xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-2xl">
              Continue Reading
            </h2>

            {continueBook ? (
              <div className="mt-6 flex flex-1 gap-5">
                <Link to={`/books/${continueBook.slug}`} className="shrink-0">
                  <BookCover book={continueBook} size="md" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/books/${continueBook.slug}`}>
                    <h3 className="font-sans text-lg font-bold text-ink-900 hover:text-islamic-green dark:text-white dark:hover:text-accent">
                      {continueBook.title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-white/60">
                    {continueBook.description}
                  </p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-ink-500">
                      <span>{progressHint ?? 'Saved for later'}</span>
                      <span>Open reader</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full w-1/3 rounded-full bg-islamic-green" />
                    </div>
                  </div>
                  <Link
                    to={`/books/${continueBook.slug}/read`}
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-islamic-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-islamic-forest"
                  >
                    Continue Reading <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-1 flex-col items-start justify-center rounded-xl border border-dashed border-line bg-ivory/60 p-6 dark:border-white/15 dark:bg-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-islamic-green/10 text-islamic-green dark:bg-accent/15 dark:text-accent">
                  <BookOpen size={22} />
                </div>
                <h3 className="mt-4 font-sans text-lg font-bold text-ink-900 dark:text-white">
                  Discover Your First Book
                </h3>
                <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-white/60">
                  Save a book or open the reader to pick up where you left off. Your progress stays on
                  this device.
                </p>
                <Link
                  to="/library"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-accent-light"
                >
                  Browse the Library <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/92 p-5 shadow-soft backdrop-blur-sm transition-transform duration-500 hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#141414] sm:p-7">
            <div className="pointer-events-none absolute -right-6 -top-6 text-accent/15">
              <Quote size={120} strokeWidth={1} />
            </div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              Daily Benefit
            </p>
            <h2 className="mt-2 font-sans text-xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-2xl">
              Hadith of the Day
            </h2>

            {benefit.arabic && (
              <p
                dir="rtl"
                lang="ar"
                className="mt-6 font-arabic text-xl leading-relaxed text-islamic-green sm:text-2xl"
              >
                {benefit.arabic}
              </p>
            )}
            <blockquote className="mt-4 flex-1 font-sans text-base leading-relaxed text-ink-800 dark:text-white/85 sm:text-lg">
              “{benefit.english}”
            </blockquote>
            <p className="mt-4 text-sm font-medium text-ink-500">{benefit.reference}</p>
            <Link
              to="/categories"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-islamic-green hover:text-islamic-forest"
            >
              Explore More <ArrowRight size={14} />
            </Link>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
