import { cn } from '@/lib/utils';

interface GoldStarDividerProps {
  className?: string;
  /** Line width each side of the star */
  lineClassName?: string;
}

/** Thin gold line with a centered 8-point Islamic star — matches hero reference. */
export function GoldStarDivider({ className, lineClassName }: GoldStarDividerProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden>
      <span className={cn('h-px flex-1 bg-accent/80', lineClassName)} />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent">
        {/* Two overlapping squares → classic 8-point star */}
        <path
          d="M12 2.5L14.2 9.8L21.5 12L14.2 14.2L12 21.5L9.8 14.2L2.5 12L9.8 9.8L12 2.5Z"
          fill="currentColor"
        />
        <path
          d="M12 5.2L13.4 10.6L18.8 12L13.4 13.4L12 18.8L10.6 13.4L5.2 12L10.6 10.6L12 5.2Z"
          fill="currentColor"
          className="opacity-90"
        />
      </svg>
      <span className={cn('h-px flex-1 bg-accent/80', lineClassName)} />
    </div>
  );
}
