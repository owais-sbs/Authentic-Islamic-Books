import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  to?: string;
  variant?: 'default' | 'onGreen';
}

/** Logo mark + compact wordmark — header & footer. */
export function BrandLogo({ className, to = '/', variant = 'default' }: BrandLogoProps) {
  const onGreen = variant === 'onGreen';

  return (
    <Link
      to={to}
      className={cn('group inline-flex shrink-0 items-center gap-2.5', className)}
      aria-label="Authentic Islamic Books — Home"
    >
      <img
        src="/Authentic Islamic Books final logo.png"
        alt=""
        className="h-9 w-9 object-contain sm:h-10 sm:w-10"
        width={40}
        height={40}
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            'font-serif text-[15px] font-semibold uppercase tracking-[0.04em] sm:text-[17px]',
            onGreen
              ? 'text-white transition-opacity group-hover:opacity-90'
              : 'text-islamic-green transition-colors group-hover:text-islamic-forest dark:text-white dark:group-hover:text-accent',
          )}
        >
          Authentic
        </span>
        <span
          className={cn(
            'mt-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px]',
            onGreen ? 'text-accent' : 'text-accent-dark dark:text-accent',
          )}
        >
          Islamic Books
        </span>
      </span>
    </Link>
  );
}
