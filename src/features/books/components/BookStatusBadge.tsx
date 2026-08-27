import type { BookStatus } from '../types';
import { cn } from '@/lib/utils';

const CONFIG: Record<BookStatus, { label: string; cls: string }> = {
  processing:   { label: 'Processing',   cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
  needs_review: { label: 'Needs Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  draft:        { label: 'Draft',        cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  published:    { label: 'Published',    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  archived:     { label: 'Archived',     cls: 'bg-slate-100 text-slate-400 border border-slate-200' },
  failed:       { label: 'Failed',       cls: 'bg-red-50 text-red-600 border border-red-200' },
};

interface BookStatusBadgeProps {
  status: BookStatus;
  className?: string;
}

export function BookStatusBadge({ status, className }: BookStatusBadgeProps) {
  const { label, cls } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        cls,
        className
      )}
    >
      {label}
    </span>
  );
}
