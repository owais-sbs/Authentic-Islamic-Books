import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  count?: number;
  className?: string;
}

export function Checkbox({ checked, onChange, label, count, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 rounded-md py-1.5 text-sm transition-colors hover:text-ink-900',
        checked ? 'text-ink-900' : 'text-ink-600',
        className
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border transition-all',
            checked
              ? 'border-accent bg-accent text-cream'
              : 'border-line-strong bg-cream'
          )}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span>{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-ink-400">{count}</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
