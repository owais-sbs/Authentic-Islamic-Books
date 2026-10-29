import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/** Clean professional hero — mobile uses dedicated bg image; desktop keeps studio books. */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F4EE] dark:bg-black">
      <div className="absolute inset-0">
        {/* Mobile-only background */}
        <img
          src="/brand/hero-mobile.jpg"
          alt=""
          className="h-full w-full object-cover object-[center_28%] sm:hidden"
        />
        {/* Desktop / tablet background */}
        <img
          src="/brand/hero-books.jpg"
          alt=""
          className="hidden h-full w-full object-cover object-[65%_center] sm:block lg:object-right"
        />
        {/* Mobile: soft top veil for copy; image still visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F4EE]/92 via-[#F7F4EE]/55 to-[#F7F4EE]/25 dark:from-black/90 dark:via-black/55 dark:to-black/30 sm:hidden" />
        {/* Desktop: left cream fade */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#F7F4EE] via-[#F7F4EE]/85 to-transparent dark:from-black dark:via-black/80 dark:to-transparent sm:block" />
      </div>

      <div className="container-page relative z-10 flex min-h-[78vh] items-start pt-10 pb-14 sm:min-h-[76vh] sm:items-center sm:py-20 lg:min-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg lg:max-w-xl"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-dark dark:text-accent sm:text-xs">
            Discover · Read · Learn
          </p>

          <h1 className="mt-4 font-serif text-[1.9rem] font-semibold leading-[1.18] tracking-tight text-islamic-green dark:text-white min-[380px]:text-[2.1rem] sm:mt-5 sm:text-5xl lg:text-[3.35rem]">
            Authentic Islamic Knowledge for a Better Tomorrow
          </h1>

          <p className="mt-4 max-w-md font-sans text-[14px] leading-relaxed text-ink-600 dark:text-white/70 sm:mt-5 sm:text-[15px]">
            Explore a timeless collection of authentic Islamic books, from the Qur&apos;an and Hadith
            to classical works, tafsir, and more — all in one place.
          </p>

          <div className="mt-7 sm:mt-8">
            <Link
              to="/library"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-islamic-green px-5 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-islamic-forest sm:w-auto sm:py-3 dark:bg-accent dark:text-ink-900 dark:hover:bg-accent-light"
            >
              Explore Our Library
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
