/**
 * Non-destructive Arabic text layers.
 *
 * - original: exact extracted string (never mutated for display)
 * - normalized: safe cleanup for structure (presentation forms, ZW*, tatweel-only noise)
 * - display: repaired for reading (fragment join) — does NOT replace original
 */

import { repairFragmentedArabic } from './arabic';

const ARABIC_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Quranic / orthographic marks that must never be stripped. */
const PRESERVED_MARKS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E8\u06EA-\u06ED\u08D3-\u08FF]/;

export interface ArabicTextLayers {
  original: string;
  normalized: string;
  display: string;
}

/** Light cleanup that keeps harakat, Quranic marks, and letter identity. */
export function normalizeArabicPreserveDiacritics(text: string): string {
  return (
    text
      // Only unwrap presentation ligatures — leave NFC harakat alone
      .replace(/[\uFB50-\uFDFF\uFE70-\uFEFF]/g, (ch) => ch.normalize('NFKC'))
      // Zero-width / bidi controls that break shaping (not diacritics)
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
      // Isolate / embedding marks (direction handled in HTML)
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
      // Collapse decorative tatweel runs but keep a single elongation if intentional mid-word is rare —
      // strip only when flanked by spaces (extraction noise)
      .replace(/\s\u0640+\s/g, ' ')
      .replace(/^\u0640+|\u0640+$/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\s+([،؛؟!.])/g, '$1')
      .trim()
  );
}

/**
 * Build original / normalized / display layers.
 * Display repairs spaced PDF glyphs; original is never overwritten.
 */
export function buildArabicTextLayers(extracted: string): ArabicTextLayers {
  const original = extracted;
  const normalized = normalizeArabicPreserveDiacritics(extracted);
  const display = ARABIC_SCRIPT.test(normalized)
    ? repairFragmentedArabic(normalized)
    : normalized;
  return { original, normalized, display };
}

/** True if string contains Arabic script (incl. presentation forms). */
export function containsArabicScript(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
}

/** True if text includes harakat / Quranic orthography worth preserving carefully. */
export function hasArabicDiacritics(text: string): boolean {
  return PRESERVED_MARKS.test(text);
}

/**
 * Prefer display text for the reader, but never invent diacritics.
 * If repair would drop most diacritics relative to original, keep normalized.
 */
export function pickArabicDisplayText(layers: ArabicTextLayers): string {
  if (!hasArabicDiacritics(layers.original)) return layers.display;
  const origMarks = (layers.original.match(PRESERVED_MARKS) || []).length;
  const dispMarks = (layers.display.match(PRESERVED_MARKS) || []).length;
  if (origMarks > 0 && dispMarks < origMarks * 0.7) {
    return layers.normalized;
  }
  return layers.display;
}
