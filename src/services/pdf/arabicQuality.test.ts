import { describe, expect, it } from 'vitest';
import {
  assessArabicQuality,
  isFragmentedArabic,
  looksVisuallyReversedArabic,
  pickBetterPageText,
  shouldSortRtlByDescendingX,
} from './arabicQuality';

describe('arabicQuality', () => {
  it('detects reversed salawat artefact', () => {
    expect(looksVisuallyReversedArabic('ملسو هيلع هللا ىلص')).toBe(true);
    expect(looksVisuallyReversedArabic('صلى الله عليه وسلم')).toBe(false);
  });

  it('detects fragmented Arabic tokens', () => {
    const broken = 'ا ل ح م د ل ل ه ر ب ا ل ع ا ل م ي ن و ا ل ص ل ا ة';
    expect(isFragmentedArabic(broken)).toBe(true);
    expect(isFragmentedArabic('الحمد لله رب العالمين')).toBe(false);
  });

  it('does not flag clean Quranic Arabic with diacritics', () => {
    const ayah = 'وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا';
    const q = assessArabicQuality(ayah);
    expect(q.fragmented).toBe(false);
    expect(q.visuallyReversed).toBe(false);
    expect(q.needsReview).toBe(false);
  });

  it('prefers healthier OCR over reversed text layer', () => {
    const layer = 'ملسو هيلع هللا ىلص وبعض النص';
    const ocr = 'صلى الله عليه وسلم وبعض النص العربي الواضح هنا';
    const picked = pickBetterPageText(layer, ocr);
    expect(picked.source).toBe('ocr');
  });

  it('keeps document order when glyphs already decrease in x (logical stream)', () => {
    const glyphs = [
      { x: 300, width: 10, str: 'ب' },
      { x: 280, width: 10, str: 'س' },
      { x: 260, width: 10, str: 'م' },
    ];
    expect(shouldSortRtlByDescendingX(glyphs)).toBe(false);
  });

  it('sorts by descending x when glyphs increase in x (visual stream)', () => {
    const glyphs = [
      { x: 260, width: 10, str: 'م' },
      { x: 280, width: 10, str: 'س' },
      { x: 300, width: 10, str: 'ب' },
    ];
    expect(shouldSortRtlByDescendingX(glyphs)).toBe(true);
  });
});
