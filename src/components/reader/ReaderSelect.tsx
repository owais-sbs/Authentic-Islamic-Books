import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReaderSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface ReaderSelectProps {
  label: string;
  value: string;
  options: ReaderSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  /** Wider trigger for longer labels like volume names */
  wide?: boolean;
}

/**
 * Custom reader dropdown — never uses native <select> (avoids ugly mobile OS pickers).
 * Opens a bottom sheet on small screens and a floating panel on larger ones.
 */
export function ReaderSelect({
  label,
  value,
  options,
  onChange,
  className,
  wide,
}: ReaderSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [open, value]);

  function pick(next: string) {
    if (next === value) {
      setOpen(false);
      return;
    }
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={cn('relative min-w-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-11 max-w-[42vw] items-center gap-1.5 rounded-xl px-3 text-left text-[13px] font-semibold shadow-sm ring-1 ring-black/8 transition-colors sm:max-w-[200px]',
          wide ? 'min-w-[7.5rem]' : 'min-w-[5.75rem]',
          open ? 'bg-accent/25 ring-accent/40' : 'bg-black/[0.045] hover:bg-black/[0.07]',
        )}
        style={{ color: 'var(--reader-text)' }}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? label}</span>
        <ChevronDown
          size={15}
          className={cn('shrink-0 opacity-60 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <>
          {/* Backdrop — tap outside to close */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-ink-900/35 sm:bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          {/* Mobile: bottom sheet · Desktop: popover above trigger */}
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            ref={listRef}
            className={cn(
              'z-50 overflow-hidden reader-card shadow-xl ring-1 ring-black/10',
              // Mobile sheet
              'fixed inset-x-0 bottom-0 max-h-[min(70vh,28rem)] rounded-t-2xl pb-[env(safe-area-inset-bottom,0px)]',
              // Desktop popover
              'sm:absolute sm:inset-x-auto sm:bottom-full sm:left-1/2 sm:mb-2 sm:w-56 sm:-translate-x-1/2 sm:rounded-xl sm:pb-0',
            )}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 sm:px-3 sm:py-2.5">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--reader-text)' }}>
                {label}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full reader-muted hover:bg-black/5 sm:h-7 sm:w-7"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[min(58vh,22rem)] overflow-y-auto overscroll-contain py-1.5 sm:max-h-64">
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-active={active ? 'true' : 'false'}
                    disabled={opt.disabled}
                    onClick={() => pick(opt.value)}
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] transition-colors sm:px-3 sm:py-2 sm:text-[13px]',
                      active
                        ? 'bg-accent/20 font-semibold'
                        : 'hover:bg-black/[0.04]',
                      opt.disabled && 'opacity-40',
                    )}
                    style={{ color: 'var(--reader-text)' }}
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {active && <Check size={16} className="shrink-0 text-accent-dark" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
