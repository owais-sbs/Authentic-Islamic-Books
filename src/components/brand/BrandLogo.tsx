import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  to?: string;
  variant?: 'default' | 'onGreen';
  /** Compact wordmark for very narrow headers */
  compact?: boolean;
}

/** Text-only wordmark — Authentic Islamic Books. */
export function BrandLogo({ className, to = '/', variant = 'default', compact }: BrandLogoProps) {
  const onGreen = variant === 'onGreen';

  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex min-w-0 max-w-full items-baseline gap-0.5 sm:gap-1',
        className,
      )}
      aria-label="Authentic Islamic Books — Home"
    >
      <span
        className={cn(
          'truncate font-serif font-semibold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-islamic-green transition-colors group-hover:text-islamic-forest dark:text-white dark:group-hover:text-accent',
        )}
      >
        Authentic
      </span>
      <span
        className={cn(
          'truncate font-serif font-semibold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen ? 'text-accent' : 'text-accent-dark dark:text-accent',
        )}
      >
        Islamic
      </span>
      <span
        className={cn(
          'truncate font-serif font-semibold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-islamic-green transition-colors group-hover:text-islamic-forest dark:text-white dark:group-hover:text-accent',
        )}
      >
        Books
      </span>
    </Link>
  );
}
