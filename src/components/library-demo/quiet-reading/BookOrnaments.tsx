import { cn } from '@/lib/utils';

/** Gold diamond ornament used on book pages (matches reference). */
export function BookOrnament({ className }: { className?: string }) {
  return (
    <span className={cn('qob-ornament', className)} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.2L12.8 7L7 12.8L1.2 7L7 1.2Z"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
        />
        <path d="M7 3.8L10.2 7L7 10.2L3.8 7L7 3.8Z" fill="currentColor" opacity="0.35" />
      </svg>
    </span>
  );
}

export function PageFooterMark({
  label,
  roman,
}: {
  label: string | number;
  roman?: boolean;
}) {
  return (
    <div className="qob-page-footer">
      <span className="qob-footer-rule" />
      <BookOrnament />
      <span className={cn('qob-page-num', roman && 'qob-page-num-roman')}>{label}</span>
      <BookOrnament />
      <span className="qob-footer-rule" />
    </div>
  );
}
