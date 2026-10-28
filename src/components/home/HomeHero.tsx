import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Library } from 'lucide-react';
import { GoldStarDivider } from '@/components/home/GoldStarDivider';

/** Cream studio hero — mobile matches reference; desktop keeps left copy / right books. */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] dark:bg-black">
      <div className="absolute inset-0">
        <img
          src="/brand/hero-books.jpg"
          alt=""
          className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-right"
        />
        {/* Mobile: soft cream veil so copy stays readable over books */}
        <div className="absolute inset-0 bg-[#F4F1EA]/55 dark:bg-black/60 sm:hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1EA]/90 via-[#F4F1EA]/55 to-[#F4F1EA]/92 dark:from-black/90 dark:via-black/55 dark:to-black/92 sm:hidden" />
        {/* sm+: side fade for left-aligned copy */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#F4F1EA] via-[#F4F1EA]/92 to-transparent sm:block sm:via-[#F4F1EA]/75 lg:from-[#F4F1EA]/95 lg:via-[#F4F1EA]/55 dark:from-black dark:via-black/85 dark:to-transparent sm:dark:via-black/70 lg:dark:from-black/95 lg:dark:via-black/55" />
      </div>

      <div className="container-page relative z-10 flex min-h-[78vh] flex-col pt-10 pb-8 sm:min-h-[80vh] sm:justify-center sm:py-24 lg:min-h-[86vh]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex w-full max-w-xl flex-col sm:max-w-xl lg:max-w-[34rem]"
        >
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-islamic-green dark:text-accent sm:text-[11px] sm:tracking-[0.28em]">
            Your Gateway to Authentic Islamic Knowledge
          </p>

          <GoldStarDivider className="mt-4 max-w-[11rem] sm:mt-5 sm:max-w-[13rem]" />

          <h1 className="mt-5 font-sans text-[1.85rem] font-bold leading-[1.15] tracking-tight text-islamic-green dark:text-white sm:mt-6 sm:text-5xl lg:text-[3.15rem]">
            Discover Authentic Islamic Knowledge
          </h1>

          <p className="mt-4 max-w-md font-sans text-[14px] leading-relaxed text-ink-600 dark:text-white/70 sm:mt-5 sm:text-base">
            Explore trusted books and deepen your understanding, one page at a time.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              to="/library"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent px-5 py-3.5 font-sans text-[15px] font-semibold text-islamic-green shadow-sm transition-all hover:bg-accent-light hover:shadow-md sm:w-auto sm:rounded-lg sm:py-3 sm:text-sm"
            >
              <BookOpen size={18} strokeWidth={1.75} className="shrink-0" />
              Start Reading Free
            </Link>
            <Link
              to="/library"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-islamic-green/35 bg-white/80 px-5 py-3.5 font-sans text-[15px] font-semibold text-islamic-green backdrop-blur-sm transition-colors hover:border-islamic-green hover:bg-white sm:w-auto sm:rounded-lg sm:py-3 sm:text-sm dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:border-white/50 dark:hover:bg-white/15"
            >
              <Library size={18} strokeWidth={1.75} className="shrink-0" />
              Browse the Library
            </Link>
          </div>
        </motion.div>

        {/* Bottom ornament — mobile reference transition into trust strip */}
        <div className="mt-auto pt-10 sm:hidden">
          <GoldStarDivider className="mx-auto max-w-[10rem] opacity-90" />
        </div>
      </div>
    </section>
  );
}
