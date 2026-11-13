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
        'group inline-flex min-w-0 max-w-full items-baseline gap-1',
        className,
      )}
      aria-label="Authentic Islamic Books — Home"
    >
      <span
        className={cn(
          'truncate font-sans font-bold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-[#1B4F72] transition-colors dark:text-white',
        )}
      >
        Authentic
      </span>
      <span
        className={cn(
          'truncate font-sans font-bold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen ? 'text-blue-200' : 'text-[#64748B] dark:text-neutral-400',
        )}
      >
        Islamic
      </span>
      <span
        className={cn(
          'truncate font-sans font-bold tracking-tight',
          compact ? 'text-[0.95rem]' : 'text-[0.95rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-[#1B4F72] transition-colors dark:text-white',
        )}
      >
        Books
      </span>
    </Link>
  );
}
