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

        {/* Mobile: strong cream wash behind copy, image peeks at bottom */}
        <div
          className="absolute inset-0 sm:hidden dark:hidden"
          style={{
            background:
              'linear-gradient(180deg, #F7F4EE 0%, #F7F4EE 42%, rgba(247,244,238,0.94) 58%, rgba(247,244,238,0.55) 78%, rgba(247,244,238,0.2) 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block sm:!hidden"
          style={{
            background:
              'linear-gradient(180deg, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.25) 100%)',
          }}
        />

        {/* Desktop: left cream fade */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#F7F4EE] via-[#F7F4EE]/88 to-transparent dark:from-black dark:via-black/82 dark:to-transparent sm:block" />
      </div>

      <div className="container-page relative z-10 flex min-h-[78vh] flex-col justify-between pt-8 pb-10 sm:min-h-[76vh] sm:justify-center sm:py-20 lg:min-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-lg lg:max-w-xl"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-dark dark:text-accent sm:text-xs">
            Discover · Read · Learn
          </p>

          <h1 className="mt-3 font-serif text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-islamic-green dark:text-white min-[380px]:text-[2.05rem] sm:mt-5 sm:text-5xl lg:text-[3.35rem]">
            Authentic Islamic Knowledge for a Better Tomorrow
          </h1>

          <p className="mt-3.5 max-w-md font-sans text-[14px] leading-relaxed text-ink-700 dark:text-white/75 sm:mt-5 sm:text-[15px] sm:text-ink-600">
            Explore a timeless collection of authentic Islamic books, from the Qur&apos;an and Hadith
            to classical works, tafsir, and more — all in one place.
          </p>

          <div className="mt-6 sm:mt-8">
            <Link
              to="/library"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-islamic-green px-5 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-islamic-forest sm:w-auto sm:py-3 dark:bg-accent dark:text-ink-900 dark:hover:bg-accent-light"
            >
              Explore Our Library
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </motion.div>

        {/* Spacer so mobile image shows under the copy wash */}
        <div className="mt-8 min-h-[28vh] sm:hidden" aria-hidden />
      </div>
    </section>
  );
}
