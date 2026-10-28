import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/** Cream studio hero — books on the right; copy vertically centered on the left. */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] dark:bg-black">
      <div className="absolute inset-0">
        <img
          src="/brand/hero-books.jpg"
          alt=""
          className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1EA] via-[#F4F1EA]/92 to-transparent sm:via-[#F4F1EA]/75 lg:from-[#F4F1EA]/95 lg:via-[#F4F1EA]/55 lg:to-transparent dark:from-black dark:via-black/85 dark:to-transparent sm:dark:via-black/70 lg:dark:from-black/95 lg:dark:via-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F1EA]/40 via-transparent to-[#F4F1EA]/25 dark:from-black/50 dark:to-black/30 lg:hidden" />
      </div>

      <div className="container-page relative z-10 flex min-h-[72vh] items-center py-20 sm:min-h-[80vh] sm:py-24 lg:min-h-[86vh]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex w-full max-w-xl flex-col justify-center lg:max-w-[34rem]"
        >
          <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-islamic-green dark:text-accent sm:text-xs">
            Your Gateway to Authentic Islamic Knowledge
          </p>

          <h1 className="font-sans text-[2.25rem] font-bold leading-[1.12] tracking-tight text-islamic-green dark:text-white sm:text-5xl lg:text-[3.15rem]">
            Your Journey to Authentic Islamic Learning.
          </h1>

          <p className="mt-5 max-w-md font-sans text-[15px] leading-relaxed text-ink-600 dark:text-white/70 sm:text-base">
            Accessible and welcoming for readers of all experience levels.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/library"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 font-sans text-sm font-semibold text-ink-900 shadow-sm transition-all hover:bg-accent-light hover:shadow-md"
            >
              Start Reading Free
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center justify-center rounded-lg border border-islamic-green/30 bg-white/70 px-5 py-3 font-sans text-sm font-semibold text-islamic-green backdrop-blur-sm transition-colors hover:border-islamic-green hover:bg-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:border-white/50 dark:hover:bg-white/15"
            >
              Browse the Library
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
