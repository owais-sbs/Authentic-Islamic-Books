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
 * Shared public-page hero: full-bleed image (optional) or soft paper band,
 * brand-consistent typography, light overlay so imagery stays visible.
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
          <div className="absolute inset-0 bg-ink-900/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/75 via-ink-900/45 to-ink-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-ink-900/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900" />
      )}

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="relative z-10 container-page">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] tracking-wide text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-[15px] sm:text-base leading-relaxed text-white/80">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
    </section>
  );
}
