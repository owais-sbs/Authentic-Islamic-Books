import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectIconBadgeProps {
  icon: LucideIcon;
  className?: string;
  size?: 'md' | 'lg';
}

/** Circular badge — green in light mode, black in dark mode; gold icon. */
export function SubjectIconBadge({ icon: Icon, className, size = 'md' }: SubjectIconBadgeProps) {
  const dims = size === 'lg' ? 'h-[72px] w-[72px]' : 'h-16 w-16 sm:h-[68px] sm:w-[68px]';
  const iconSize = size === 'lg' ? 30 : 26;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-islamic-green shadow-[0_8px_20px_rgba(16,76,59,0.28)]',
        'ring-[3px] ring-accent ring-offset-2 ring-offset-ivory',
        'dark:bg-black dark:shadow-[0_8px_20px_rgba(0,0,0,0.45)] dark:ring-offset-black',
        dims,
        className,
      )}
      aria-hidden
    >
      <Icon size={iconSize} strokeWidth={1.6} className="text-accent" />
    </span>
  );
}
