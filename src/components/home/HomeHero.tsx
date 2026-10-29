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
          className="h-full w-full object-cover object-[center_40%] sm:hidden"
        />
        {/* Desktop / tablet background */}
        <img
          src="/brand/hero-books.jpg"
          alt=""
          className="hidden h-full w-full object-cover object-[65%_center] sm:block lg:object-right"
        />

        {/* Mobile: cream wash follows copy into mid-lower area; image peeks below */}
        <div
          className="absolute inset-0 sm:hidden dark:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(247,244,238,0.7) 0%, rgba(247,244,238,0.9) 22%, rgba(247,244,238,0.96) 50%, rgba(247,244,238,0.88) 72%, rgba(247,244,238,0.4) 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block sm:!hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.88) 22%, rgba(0,0,0,0.94) 50%, rgba(0,0,0,0.82) 72%, rgba(0,0,0,0.35) 100%)',
          }}
        />

        {/* Desktop: left cream fade */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#F7F4EE] via-[#F7F4EE]/88 to-transparent dark:from-black dark:via-black/82 dark:to-transparent sm:block" />
      </div>

      <div className="container-page relative z-10 flex min-h-[85vh] flex-col items-center justify-center py-16 sm:min-h-[76vh] sm:items-stretch sm:py-20 lg:min-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-lg text-center sm:mx-0 sm:max-w-lg sm:text-left lg:max-w-xl"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-dark dark:text-accent sm:text-xs">
            Discover · Read · Learn
          </p>

          <h1 className="mt-3 font-serif text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-islamic-green dark:text-white min-[380px]:text-[2.05rem] sm:mt-5 sm:text-5xl lg:text-[3.35rem]">
            Where Authentic Islamic Learning Begins
          </h1>

          <p className="mx-auto mt-3.5 max-w-md font-sans text-[14px] leading-relaxed text-ink-700 dark:text-white/75 sm:mx-0 sm:mt-5 sm:text-[15px] sm:text-ink-600">
            Explore a timeless collection of authentic Islamic books, from the Qur&apos;an and Hadith
            to classical works, tafsir, and more — all in one place.
          </p>

          <div className="mt-6 flex justify-center sm:mt-8 sm:justify-start">
            <Link
              to="/library"
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-islamic-green px-5 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-islamic-forest sm:w-auto sm:max-w-none sm:py-3 dark:bg-accent dark:text-ink-900 dark:hover:bg-accent-light"
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
