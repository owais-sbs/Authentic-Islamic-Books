/**
 * Arabic extraction quality: detect fragmented / suspiciously reversed text,
 * score candidates, and pick safer OCR vs text-layer output without inventing
 * characters or blindly reversing every Arabic string.
 */

const ARABIC_CHAR =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_LETTER =
  /[\u0621-\u063A\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06FA-\u06FF]/;
const ARABIC_MARK = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
const LATIN = /[A-Za-z]/;

/** Common phrases that appear reversed when PDF layout used visual LTR join. */
const KNOWN_FORWARD = [
  'صلى الله عليه وسلم',
  'صلی اللہ علیہ وسلم',
  'بسم الله',
  'بِسْمِ',
  'الحمد لله',
  'رضي الله',
];

const KNOWN_REVERSED = [
  'ملسو هيلع هللا ىلص',
  'ملسو هيلع هللا يلص',
  'هللا مسب',
  'هللا دمحلا',
];

export function countArabicLetters(text: string): number {
  return (text.match(new RegExp(ARABIC_LETTER.source, 'g')) || []).length;
}

export function countArabicMarks(text: string): number {
  return (text.match(new RegExp(ARABIC_MARK.source, 'g')) || []).length;
}

export function hasArabicScript(text: string): boolean {
  return ARABIC_CHAR.test(text);
}

/**
 * Fragmented extraction often yields 1–2 letter tokens separated by spaces
 * ("ا ل ل ه" / "اِ ل ْ سَ") while real Arabic prose has multi-letter words.
 * Vocalized Quranic Arabic with short particles (مَعَ، فِي) must not false-positive.
 */
export function isFragmentedArabic(text: string): boolean {
  if (!hasArabicScript(text)) return false;
  const tokens = text.split(/\s+/).filter((t) => ARABIC_CHAR.test(t));
  if (tokens.length < 8) return false;

  const letterCounts = tokens.map((t) => (t.match(new RegExp(ARABIC_LETTER.source, 'g')) || []).length);
  const short = letterCounts.filter((n) => n > 0 && n <= 2).length;
  const single = letterCounts.filter((n) => n === 1).length;
  const avg = letterCounts.reduce((a, b) => a + b, 0) / letterCounts.length;

  // Strong signal: many single-letter tokens (glyph-per-space extraction)
  if (single / tokens.length >= 0.4 && avg < 2.2) return true;
  // Weaker: mostly 1–2 letter tokens and very low average word length
  return short / tokens.length >= 0.55 && avg < 2.4;
}

/** True when known salawat / basmala appear reversed (visual-order artefact). */
export function looksVisuallyReversedArabic(text: string): boolean {
  const compact = text.replace(/\s+/g, ' ');
  if (KNOWN_REVERSED.some((p) => compact.includes(p))) return true;
  // Letter-only reverse of a known phrase (ignore marks/spaces)
  const lettersOnly = [...compact].filter((c) => ARABIC_LETTER.test(c)).join('');
  for (const phrase of KNOWN_FORWARD) {
    const forward = [...phrase].filter((c) => ARABIC_LETTER.test(c)).join('');
    if (forward.length < 6) continue;
    const reversed = [...forward].reverse().join('');
    if (lettersOnly.includes(reversed) && !lettersOnly.includes(forward)) return true;
  }
  return false;
}

/**
 * Decide glyph join order for an RTL line.
 * - If document order already tracks right→left (decreasing x), keep it (logical).
 * - If document order tracks left→right, sort by descending x to restore logical order.
 * Never blindly reverse every line.
 */
export function shouldSortRtlByDescendingX(
  glyphs: Array<{ x: number; width: number; str: string }>,
): boolean {
  const meaningful = glyphs.filter((g) => g.str.trim() && ARABIC_CHAR.test(g.str));
  if (meaningful.length < 3) return true; // default: geometric RTL join

  let decreasing = 0;
  let increasing = 0;
  for (let i = 1; i < meaningful.length; i++) {
    const dx = meaningful[i].x - meaningful[i - 1].x;
    if (dx < -0.5) decreasing += 1;
    else if (dx > 0.5) increasing += 1;
  }
  // Document order already right→left → already logical for Arabic; do NOT re-sort
  if (decreasing > increasing * 1.2) return false;
  // Document order left→right → visual stream; sort descending x
  if (increasing > decreasing * 1.2) return true;
  return true;
}

export interface ArabicQualityReport {
  fragmented: boolean;
  visuallyReversed: boolean;
  arabicLetterCount: number;
  markCount: number;
  /** 0–1 higher is better */
  score: number;
  needsReview: boolean;
  warnings: string[];
}

export function assessArabicQuality(text: string): ArabicQualityReport {
  const warnings: string[] = [];
  const fragmented = isFragmentedArabic(text);
  const visuallyReversed = looksVisuallyReversedArabic(text);
  const arabicLetterCount = countArabicLetters(text);
  const markCount = countArabicMarks(text);

  let score = 0.5;
  if (arabicLetterCount === 0) {
    score = LATIN.test(text) ? 0.55 : 0.2;
  } else {
    score = 0.7;
    if (fragmented) {
      score -= 0.35;
      warnings.push('Fragmented Arabic characters detected');
    }
    if (visuallyReversed) {
      score -= 0.4;
      warnings.push('Suspicious reversed Arabic order detected');
    }
    // Healthy mark density is a weak positive signal (not required)
    if (markCount > 0 && arabicLetterCount > 10) score += 0.05;
  }

  const needsReview = fragmented || visuallyReversed;
  return {
    fragmented,
    visuallyReversed,
    arabicLetterCount,
    markCount,
    score: Math.max(0, Math.min(1, score)),
    needsReview,
    warnings,
  };
}

/**
 * Choose between text-layer and OCR page text.
 * Prefers higher Arabic quality; ties prefer longer usable text.
 * Does not merge the two (avoids duplication).
 */
export function pickBetterPageText(
  textLayer: string,
  ocrText: string,
): { text: string; source: 'text' | 'ocr'; reason: string } {
  const a = textLayer?.trim() ?? '';
  const b = ocrText?.trim() ?? '';
  if (!a && !b) return { text: '', source: 'text', reason: 'empty' };
  if (!a) return { text: b, source: 'ocr', reason: 'text-layer empty' };
  if (!b) return { text: a, source: 'text', reason: 'ocr empty' };

  const qa = assessArabicQuality(a);
  const qb = assessArabicQuality(b);

  // Strong Arabic failure on text layer → prefer OCR when it looks healthier
  if ((qa.fragmented || qa.visuallyReversed) && qb.score > qa.score + 0.08) {
    return { text: b, source: 'ocr', reason: 'OCR healthier Arabic than text layer' };
  }
  if ((qb.fragmented || qb.visuallyReversed) && qa.score > qb.score + 0.08) {
    return { text: a, source: 'text', reason: 'text layer healthier than OCR' };
  }

  // Both Latin / similar: prefer longer without huge inflation (OCR noise)
  if (Math.abs(qa.score - qb.score) < 0.08) {
    if (b.length > a.length * 1.35 && b.length < a.length * 4) {
      return { text: b, source: 'ocr', reason: 'OCR more complete' };
    }
    return { text: a, source: 'text', reason: 'text layer preferred' };
  }

  return qa.score >= qb.score
    ? { text: a, source: 'text', reason: 'higher quality score' }
    : { text: b, source: 'ocr', reason: 'higher quality score' };
}

/** True when page text should be OCR'd even if some characters exist. */
export function pageNeedsArabicOcr(text: string): boolean {
  const q = assessArabicQuality(text);
  return q.fragmented || q.visuallyReversed;
}
