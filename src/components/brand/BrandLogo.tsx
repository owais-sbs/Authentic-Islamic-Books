import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  to?: string;
  /** White lockup for green/black footer */
  variant?: 'default' | 'onGreen';
}

/** Text-only brand lockup — left-aligned, no icon. */
export function BrandLogo({ className, to = '/', variant = 'default' }: BrandLogoProps) {
  const onGreen = variant === 'onGreen';

  return (
    <Link
      to={to}
      className={cn(
        'group flex shrink-0 flex-col items-start justify-center leading-none',
        className,
      )}
      aria-label="Authentic Islamic Books — Home"
    >
      <span
        className={cn(
          'font-sans text-[12px] font-bold uppercase tracking-[0.1em] transition-colors sm:text-[15px]',
          onGreen
            ? 'text-white group-hover:text-white/90'
            : 'text-islamic-green group-hover:text-[#0D3F31] dark:text-white dark:group-hover:text-white/85',
        )}
      >
        Authentic Islamic Books
      </span>
      <span className="mt-1.5 flex items-center gap-2">
        <span
          className={cn(
            'h-px w-4 sm:w-5',
            onGreen ? 'bg-white/70' : 'bg-accent/80 dark:bg-white/50',
          )}
          aria-hidden
        />
        <span
          className={cn(
            'font-sans text-[8px] font-medium uppercase tracking-[0.22em] sm:text-[10px] sm:tracking-[0.26em]',
            onGreen ? 'text-white/75' : 'text-accent-dark dark:text-white/55',
          )}
        >
          Read · Learn · Grow
        </span>
      </span>
    </Link>
  );
}
