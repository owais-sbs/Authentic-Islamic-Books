import type { ReactNode } from 'react';
import type { QuietFont, QuietTheme } from '@/data/quietReadingRoom';
import { cn } from '@/lib/utils';

interface ReadingSettingsPanelProps {
  open: boolean;
  theme: QuietTheme;
  font: QuietFont;
  fontSize: number;
  lineHeight: number;
  width: number;
  showArabic: boolean;
  onClose: () => void;
  onTheme: (t: QuietTheme) => void;
  onFont: (f: QuietFont) => void;
  onFontSize: (n: number) => void;
  onLineHeight: (n: number) => void;
  onWidth: (n: number) => void;
  onShowArabic: (v: boolean) => void;
}

export function ReadingSettingsPanel({
  open,
  theme,
  font,
  fontSize,
  lineHeight,
  width,
  showArabic,
  onClose,
  onTheme,
  onFont,
  onFontSize,
  onLineHeight,
  onWidth,
  onShowArabic,
}: ReadingSettingsPanelProps) {
  if (!open) return null;

  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed left-1/2 top-[4.25rem] z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl sm:left-auto sm:right-6 sm:translate-x-0',
          isDark
            ? 'border-[#3A4554] bg-[#323C4A] text-[#F0EBE3]'
            : isSepia
              ? 'border-[#D4C4A8] bg-[#F7F0E2] text-[#3D3224]'
              : 'border-[#D9D0C0] bg-[#FFFdf7] text-[#1F2A24]'
        )}
        role="dialog"
        aria-label="Reading settings"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[inherit] opacity-55">
          Reading Settings
        </p>

        <SettingLabel>Text Size</SettingLabel>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-serif text-sm">A</span>
          <input
            type="range"
            min={16}
            max={24}
            step={1}
            value={fontSize}
            onChange={(e) => onFontSize(Number(e.target.value))}
            className="w-full accent-[#1A3A2A]"
          />
          <span className="font-serif text-lg">A</span>
        </div>

        <SettingLabel>Line Height</SettingLabel>
        <div className="mt-2 flex items-center gap-3 text-[12px] opacity-65">
          <span>Compact</span>
          <input
            type="range"
            min={1.6}
            max={2.2}
            step={0.1}
            value={lineHeight}
            onChange={(e) => onLineHeight(Number(e.target.value))}
            className="w-full accent-[#1A3A2A]"
          />
          <span>Relaxed</span>
        </div>

        <SettingLabel>Reading Width</SettingLabel>
        <div className="mt-2 flex items-center gap-3 text-[12px] opacity-65">
          <span>Narrow</span>
          <input
            type="range"
            min={560}
            max={820}
            step={20}
            value={width}
            onChange={(e) => onWidth(Number(e.target.value))}
            className="w-full accent-[#1A3A2A]"
          />
          <span>Wide</span>
        </div>

        <SettingLabel>Font</SettingLabel>
        <div className="mt-2 flex gap-2">
          <Chip active={font === 'serif'} onClick={() => onFont('serif')} isDark={isDark}>
            Serif
          </Chip>
          <Chip active={font === 'sans'} onClick={() => onFont('sans')} isDark={isDark}>
            Sans Serif
          </Chip>
        </div>

        <SettingLabel>Arabic References</SettingLabel>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={showArabic}
            onChange={(e) => onShowArabic(e.target.checked)}
            className="accent-[#1A3A2A]"
          />
          Show Arabic
        </label>

        <SettingLabel>Theme</SettingLabel>
        <div className="mt-2 flex gap-2">
          {(['light', 'sepia', 'dark'] as QuietTheme[]).map((t) => (
            <Chip key={t} active={theme === t} onClick={() => onTheme(t)} isDark={isDark}>
              {t === 'light' ? 'Light' : t === 'sepia' ? 'Sepia' : 'Night'}
            </Chip>
          ))}
        </div>
      </div>
    </>
  );
}

function SettingLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] opacity-50">
      {children}
    </p>
  );
}

function Chip({
  children,
  active,
  onClick,
  isDark,
}: {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
  isDark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors',
        active
          ? isDark
            ? 'border-[#D4B45A]/50 bg-[#D4B45A]/15 text-[#E2C56A]'
            : 'border-[#1A3A2A]/35 bg-[#1A3A2A]/10 text-[#1A3A2A]'
          : isDark
            ? 'border-white/15 opacity-75 hover:opacity-100'
            : 'border-[#D9D0C0] opacity-80 hover:opacity-100'
      )}
    >
      {children}
    </button>
  );
}
