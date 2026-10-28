import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  imageUrl?: string;
  children?: ReactNode;
  compact?: boolean;
}

/**
 * Shared public-page hero — always dark charcoal/black under white type
 * (does not use theme ink tokens, which invert in dark mode).
 */
export function PageHero({
  eyebrow,
  title,
  description,
  imageUrl,
  children,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden ${compact ? 'py-10 sm:py-12' : 'py-14 sm:py-16'}`}
    >
      {imageUrl ? (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#141414] to-black" />
      )}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="font-sans text-3xl font-semibold leading-[1.3] tracking-tight text-white sm:text-4xl sm:leading-[1.28] lg:text-[2.75rem] lg:leading-[1.25]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent dark:from-black" />
    </section>
  );
}
