import { Minus, Plus, RotateCcw } from 'lucide-react';

interface ReadingSettingsBarProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onReset: () => void;
}

export function ReadingSettingsBar({
  fontSize,
  onIncrease,
  onDecrease,
  onReset,
}: ReadingSettingsBarProps) {
  return (
    <div className="flex w-max max-w-full flex-nowrap items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={onDecrease}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-700 hover:border-accent"
        aria-label="Decrease text size"
      >
        <Minus size={15} />
      </button>
      <span className="min-w-[2.5rem] shrink-0 text-center font-sans text-xs text-ink-500">
        {fontSize}px
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-700 hover:border-accent"
        aria-label="Increase text size"
      >
        <Plus size={15} />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-medium text-ink-600 hover:border-accent sm:px-3"
      >
        <RotateCcw size={13} />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
}
