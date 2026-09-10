import { describe, expect, it } from 'vitest';
import type { ContentBlock } from '@/types';
import { arabicRatio, classifyScript, isPrimarilyArabic } from '@/services/content/arabic';
import { parseBookContent } from '@/services/content/parseBookContent';
import { parseQuranReferenceLine, looksLikeBookReference } from '@/services/content/patterns';
import { repairLineWraps } from '@/services/content/normalizeText';

describe('arabic detection', () => {
  it('classifies pure Arabic as arabic', () => {
    const text = 'الحمد لله رب العالمين';
    expect(isPrimarilyArabic(text)).toBe(true);
    expect(classifyScript(text).kind).toBe('arabic');
    expect(arabicRatio(text)).toBeGreaterThan(0.9);
  });

  it('keeps English as latin', () => {
    expect(classifyScript('Tawheed is the foundation of belief.').kind).toBe('latin');
  });
});

describe('parseBookContent', () => {
  it('detects arabic block', () => {
    const blocks = parseBookContent('الحمد لله رب العالمين');
    expect(blocks.some((b: ContentBlock) => b.type === 'arabic' || b.type === 'quran')).toBe(true);
  });

  it('detects quran Arabic + translation + reference', () => {
    const input = [
      'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      '',
      'And establish prayer and give zakah.',
      '',
      "Qur'an 2:43",
    ].join('\n');
    const blocks = parseBookContent(input);
    const quran = blocks.find((b: ContentBlock) => b.type === 'quran');
    expect(quran).toBeTruthy();
    if (quran?.type === 'quran') {
      expect(quran.arabic).toBeTruthy();
      expect(quran.translation).toMatch(/establish prayer/i);
      expect(quran.reference).toMatch(/2:43/);
    }
  });

  it('does not treat ordinary verse-like numbers as Qur\'an', () => {
    const blocks = parseBookContent('Chapter 2 begins on page 43.');
    expect(blocks.every((b: ContentBlock) => b.type === 'paragraph')).toBe(true);
  });

  it('detects book references', () => {
    const blocks = parseBookContent("Majmu' al-Fatawa, 9/34");
    expect(blocks.some((b: ContentBlock) => b.type === 'reference')).toBe(true);
  });

  it('detects numbered section headings', () => {
    const blocks = parseBookContent('1.1 Definition of Tawheed');
    expect(blocks.some((b: ContentBlock) => b.type === 'heading')).toBe(true);
  });

  it('detects hadith with source', () => {
    const input = [
      'Narrated Abu Hurairah. The Messenger of Allah ﷺ said, “Actions are by intentions.”',
      '',
      'Sahih al-Bukhari',
    ].join('\n');
    const blocks = parseBookContent(input);
    expect(blocks.some((b: ContentBlock) => b.type === 'hadith')).toBe(true);
  });

  it('detects scholar quotations', () => {
    const input = ['Ibn Taymiyyah said:', '', '"Faith increases and decreases."'].join('\n');
    const blocks = parseBookContent(input);
    const quote = blocks.find((b: ContentBlock) => b.type === 'quote');
    expect(quote).toBeTruthy();
    if (quote?.type === 'quote') {
      expect(quote.attribution || quote.author).toMatch(/Ibn Taymiyyah/i);
    }
  });

  it('keeps footnotes separate from body', () => {
    const input = [
      'This ruling is established.[1]',
      '',
      '[1] Majmu\' al-Fatawa, 9/34.',
    ].join('\n');
    const blocks = parseBookContent(input);
    expect(blocks.some((b: ContentBlock) => b.type === 'footnote')).toBe(true);
    expect(blocks.some((b: ContentBlock) => b.type === 'paragraph')).toBe(true);
  });
});

describe('patterns', () => {
  it('parses explicit Qur\'an references with high confidence', () => {
    const r = parseQuranReferenceLine("Qur'an 2:43");
    expect(r?.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('gives bare verse low confidence', () => {
    const r = parseQuranReferenceLine('2:43');
    expect(r?.confidence).toBeLessThan(0.5);
  });

  it('detects Majmu citations', () => {
    expect(looksLikeBookReference("Majmu' al-Fatawa, 9/34")?.confidence).toBeGreaterThan(0.7);
  });
});

describe('normalize', () => {
  it('joins soft-wrapped lines', () => {
    const text = repairLineWraps('This sentence was split\nacross two lines.');
    expect(text).toContain('split across');
    expect(text).not.toContain('\nacross');
  });

  it('preserves numbered headings', () => {
    const text = repairLineWraps('2. The Importance of Tawheed\n\nBody text continues here.');
    expect(text).toContain('2. The Importance of Tawheed');
  });
});
