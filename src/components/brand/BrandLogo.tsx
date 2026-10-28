import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  to?: string;
  variant?: 'default' | 'onGreen';
}

/** Clean professional text wordmark — header & footer. */
export function BrandLogo({ className, to = '/', variant = 'default' }: BrandLogoProps) {
  const onGreen = variant === 'onGreen';

  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex shrink-0 flex-col items-start justify-center leading-none',
        className,
      )}
      aria-label="Authentic Islamic Books — Home"
    >
      <span
        className={cn(
          'font-sans text-[12px] font-bold uppercase tracking-[0.04em] sm:text-[13px] lg:text-[14px]',
          onGreen
            ? 'text-white transition-opacity group-hover:opacity-90'
            : 'text-ink-900 transition-colors group-hover:text-islamic-green dark:text-white dark:group-hover:text-accent',
        )}
      >
        Authentic{' '}
        <span className={onGreen ? 'text-accent' : 'text-accent-dark dark:text-accent'}>
          Islamic
        </span>{' '}
        Books
      </span>
      <span
        className={cn(
          'mt-1.5 flex items-center gap-2',
          onGreen ? 'text-white/70' : 'text-ink-400 dark:text-white/50',
        )}
      >
        <span
          className={cn('h-px w-4 sm:w-5', onGreen ? 'bg-accent/80' : 'bg-accent')}
          aria-hidden
        />
        <span className="font-sans text-[9px] font-medium uppercase tracking-[0.28em] sm:text-[10px]">
          Read · Learn · Grow
        </span>
        <span
          className={cn('h-px w-4 sm:w-5', onGreen ? 'bg-accent/80' : 'bg-accent')}
          aria-hidden
        />
      </span>
    </Link>
  );
}
