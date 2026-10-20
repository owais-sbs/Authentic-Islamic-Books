/**
 * Production books always use Format 06 — Complete Scholarly Edition
 * (the sixth template on /library). No format dropdown in import.
 */
export const READING_FORMAT_06 = 'combined-edition' as const;
export const FORMAT_06_NUMBER = '06';
export const FORMAT_06_NAME = 'Complete Scholarly Edition';
export const FORMAT_06_LABEL = 'BOOK 06 · Complete Scholarly Edition';

export const FORMAT_06_FEATURES = [
  'Book layout',
  'Citations',
  'Red highlights',
] as const;

export const FORMAT_06_COVER_GRADIENT =
  'linear-gradient(155deg, #0B1929 0%, #1A3A2A 35%, #8B2E2E 70%, #C9A84C55 100%)';
