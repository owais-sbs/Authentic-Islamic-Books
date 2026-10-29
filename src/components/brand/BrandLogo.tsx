import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  to?: string;
  variant?: 'default' | 'onGreen';
}

/** Text-only wordmark — Authentic Islamic Books. */
export function BrandLogo({ className, to = '/', variant = 'default' }: BrandLogoProps) {
  const onGreen = variant === 'onGreen';

  return (
    <Link
      to={to}
      className={cn('group inline-flex shrink-0 items-baseline gap-1', className)}
      aria-label="Authentic Islamic Books — Home"
    >
      <span
        className={cn(
          'font-serif text-[1.05rem] font-semibold tracking-tight sm:text-[1.2rem]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-islamic-green transition-colors group-hover:text-islamic-forest dark:text-white dark:group-hover:text-accent',
        )}
      >
        Authentic
      </span>
      <span
        className={cn(
          'font-serif text-[1.05rem] font-semibold tracking-tight sm:text-[1.2rem]',
          onGreen ? 'text-accent' : 'text-accent-dark dark:text-accent',
        )}
      >
        Islamic
      </span>
      <span
        className={cn(
          'font-serif text-[1.05rem] font-semibold tracking-tight sm:text-[1.2rem]',
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
