import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type ReaderTheme = 'light' | 'sepia' | 'dark';
export type ReadingWidth = 'compact' | 'comfortable' | 'wide';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  theme: ReaderTheme;
  width: ReadingWidth;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.85,
  theme: 'light',
  width: 'comfortable',
};

export function useReaderSettings(bookSlug: string) {
  const [settings, setSettings] = useLocalStorage<ReaderSettings>(
    `idl-reader-settings`,
    defaultSettings
  );

  const increaseFontSize = () =>
    setSettings((s) => ({ ...s, fontSize: Math.min(s.fontSize + 1, 24) }));

  const decreaseFontSize = () =>
    setSettings((s) => ({ ...s, fontSize: Math.max(s.fontSize - 1, 15) }));

  const resetFontSize = () => setSettings((s) => ({ ...s, fontSize: defaultSettings.fontSize }));

  const setLineHeight = (lineHeight: number) => setSettings((s) => ({ ...s, lineHeight }));

  const setTheme = (theme: ReaderTheme) => setSettings((s) => ({ ...s, theme }));

  const setWidth = (width: ReadingWidth) => setSettings((s) => ({ ...s, width }));

  const widthClass =
    settings.width === 'compact'
      ? 'max-w-[600px]'
      : settings.width === 'wide'
      ? 'max-w-[820px]'
      : 'max-w-[720px]';

  const themeClass = `reader-theme-${settings.theme}`;

  return {
    settings,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setLineHeight,
    setTheme,
    setWidth,
    widthClass,
    themeClass,
  };
}
