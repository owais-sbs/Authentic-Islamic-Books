import { motion, AnimatePresence } from 'framer-motion';
import { Type, Sun, Moon, FileText, AlignLeft, X } from 'lucide-react';
import type { ReaderSettings, ReaderTheme, ReadingWidth } from '@/hooks/useReaderSettings';

interface ReadingSettingsProps {
  open: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onResetFont: () => void;
  onSetTheme: (theme: ReaderTheme) => void;
  onSetWidth: (width: ReadingWidth) => void;
  onSetLineHeight: (lh: number) => void;
}

const themes: { value: ReaderTheme; label: string; icon: typeof Sun; bg: string; fg: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, bg: '#FDFCF8', fg: '#242424' },
  { value: 'sepia', label: 'Sepia', icon: FileText, bg: '#F4ECD8', fg: '#3B2F1E' },
  { value: 'dark', label: 'Dark', icon: Moon, bg: '#1C1E1A', fg: '#D5D3CC' },
];

const widths: { value: ReadingWidth; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'wide', label: 'Wide' },
];

export function ReadingSettings({
  open,
  onClose,
  settings,
  onIncreaseFont,
  onDecreaseFont,
  onResetFont,
  onSetTheme,
  onSetWidth,
  onSetLineHeight,
}: ReadingSettingsProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-cream shadow-xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Reading settings"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
                <Type size={16} /> Reading Settings
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-ink-500 transition-colors hover:bg-paper"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Font Size */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Font Size
                </label>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={onDecreaseFont}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
                    aria-label="Decrease font size"
                  >
                    <span className="text-sm">A−</span>
                  </button>
                  <button
                    onClick={onResetFont}
                    className="text-sm font-medium text-ink-600 hover:text-ink-900"
                    aria-label="Reset font size"
                  >
                    {settings.fontSize}px
                  </button>
                  <button
                    onClick={onIncreaseFont}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
                    aria-label="Increase font size"
                  >
                    <span className="text-base">A+</span>
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Theme
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {themes.map((theme) => {
                    const active = settings.theme === theme.value;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => onSetTheme(theme.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                          active ? 'border-accent' : 'border-line hover:border-line-strong'
                        }`}
                        aria-pressed={active}
                      >
                        <div
                          className="flex h-8 w-full rounded items-center justify-center"
                          style={{ backgroundColor: theme.bg, color: theme.fg }}
                        >
                          <theme.icon size={16} />
                        </div>
                        <span className={`text-xs ${active ? 'font-medium text-ink-900' : 'text-ink-500'}`}>
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading Width */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Reading Width
                </label>
                <div className="mt-3 flex gap-2">
                  {widths.map((width) => {
                    const active = settings.width === width.value;
                    return (
                      <button
                        key={width.value}
                        onClick={() => onSetWidth(width.value)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                          active
                            ? 'border-accent bg-accent-subtle text-accent-dark font-medium'
                            : 'border-line text-ink-600 hover:border-line-strong'
                        }`}
                        aria-pressed={active}
                      >
                        {width.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Line Spacing
                </label>
                <div className="mt-3 flex gap-2">
                  {[
                    { value: 1.6, label: 'Tight' },
                    { value: 1.85, label: 'Normal' },
                    { value: 2.0, label: 'Relaxed' },
                  ].map((option) => {
                    const active = Math.abs(settings.lineHeight - option.value) < 0.01;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onSetLineHeight(option.value)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                          active
                            ? 'border-accent bg-accent-subtle text-accent-dark font-medium'
                            : 'border-line text-ink-600 hover:border-line-strong'
                        }`}
                        aria-pressed={active}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
