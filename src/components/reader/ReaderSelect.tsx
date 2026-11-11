import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
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
 * Compact opaque reader dropdown — solid panel, readable on any page background.
 * Avoids native mobile <select>.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('touchstart', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [open, value]);

  function pick(next: string) {
    if (next !== value) onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-10 items-center gap-1 rounded-lg border border-[#D8D3C8] bg-[#FDFCF8] px-2.5 text-left text-[12px] font-semibold text-[#0B1929] shadow-sm transition-colors',
          'max-w-[38vw] sm:max-w-[11rem]',
          wide ? 'min-w-[6.5rem]' : 'min-w-[5.25rem]',
          open && 'border-[#C9A84C] bg-[#F5EFD9]',
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? label}</span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-[#64748B] transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          ref={listRef}
          className={cn(
            'absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-[9.5rem] -translate-x-1/2 overflow-hidden',
            'rounded-lg border border-[#D8D3C8] bg-[#FDFCF8] shadow-[0_8px_28px_rgba(11,25,41,0.22)]',
          )}
        >
          <p className="border-b border-[#E5E1D8] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
            {label}
          </p>
          <div className="max-h-44 overflow-y-auto overscroll-contain py-0.5">
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
                    'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[12px] transition-colors',
                    active
                      ? 'bg-[#C9A84C]/35 font-semibold text-[#0B1929]'
                      : 'text-[#0B1929] hover:bg-[#F0EBE0]',
                    opt.disabled && 'opacity-40',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {active && <Check size={13} className="shrink-0 text-[#8C7030]" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
