import { describe, expect, it } from 'vitest';
import { GlyphDecoder, applyRegionTexts, headingRegionsToOcr, type PdfSpaceWord } from './glyphDecoder';
import { layoutTextItems, type PdfTextItem } from './layout';
import { matchHeadingLine, normalizeSurahTitle } from './structureDetector';
import { pageTextIsGarbled } from './documentType';

/** Encode text with a private-use "cipher" like a font without a character map. */
const CIPHER = new Map([...'abcdefghijklmnopqrstuvwxyzAEFMWY '].map((ch, i) => [ch, String.fromCharCode(0xf001 + i)]));
const encode = (text: string) => [...text].map((ch) => CIPHER.get(ch) ?? ch).join('');

function item(str: string, x: number, y: number, width: number, fontName = 'damaged', size = 10): PdfTextItem {
  return { str, transform: [size, 0, 0, size, x, y], width, fontName };
}

function word(text: string, x0: number, y: number, size = 10): PdfSpaceWord {
  return { text, x0, x1: x0 + text.length * 5, y0: y - 2, y1: y + size * 0.7 };
}

describe('GlyphDecoder (fonts without a character map)', () => {
  it('detects garbled page text', () => {
    expect(pageTextIsGarbled(encode('the scholars have agreed upon this matter'))).toBe(true);
    expect(pageTextIsGarbled('the scholars have agreed upon this matter')).toBe(false);
  });

  it('learns the code → letter mapping from OCR words at the same position', () => {
    const items = [item(encode('seek knowledge'), 50, 700, 70), item(encode('the believer'), 50, 685, 60)];
    const words = [word('seek', 50, 700), word('knowledge', 75, 700), word('the', 50, 685), word('believer', 70, 685)];
    const decoder = new GlyphDecoder();
    decoder.learn(items, words);
    // Letters learned on one line decode another line in the same font
    const decoded = decoder.decode([item(encode('the knowledge'), 50, 600, 65)]);
    expect(decoded[0].str).toBe('the knowledge');
  });

  it('ignores OCR that does not line up with the item', () => {
    const decoder = new GlyphDecoder();
    decoder.learn([item(encode('seek'), 50, 700, 20)], [word('completely different', 50, 700)]);
    expect(decoder.coverage([item(encode('seek'), 50, 700, 20)])).toBe(0);
  });

  it('solves letters OCR never saw from the book’s own vocabulary', () => {
    const decoder = new GlyphDecoder();
    // OCR taught every lowercase letter, but no capitals
    const lower = 'abcdefghijklmnopqrstuvwxyz ';
    decoder.learn([item(encode(lower), 50, 700, 135)], [word(lower.trim(), 50, 700)]);
    const readable = [item('He is the Exalted in Might, the Forgiving, the Most Merciful.', 50, 500, 300, 'times')];
    const damaged = [
      item(encode('the Exalted in Might'), 50, 400, 100),
      item(encode('Exalted and Merciful'), 50, 380, 100),
      item(encode('Might of the Most Merciful'), 50, 360, 130),
    ];
    decoder.learnFromVocabulary([readable, damaged]);
    expect(decoder.decode(damaged).map((i) => i.str)).toEqual([
      'the Exalted in Might',
      'Exalted and Merciful',
      'Might of the Most Merciful',
    ]);
  });

  it('finds banner strips that still need OCR and replaces them', () => {
    const decoder = new GlyphDecoder();
    const body = Array.from({ length: 10 }, (_, i) => item('body text line', 50, 600 - i * 12, 200, 'times'));
    const banner = item(encode('Surat al-Mulk'), 80, 680, 150, 'banner', 20);
    const items = [banner, ...body];
    const regions = headingRegionsToOcr(items, decoder);
    expect(regions).toHaveLength(1);
    const replaced = applyRegionTexts(items, [{ region: regions[0], text: '(67) Surat al-Mulk' }]);
    expect(replaced[0].str).toBe('(67) Surat al-Mulk');
  });
});

describe('two-column pages', () => {
  it('reads the left column fully before the right column', () => {
    const items: PdfTextItem[] = [];
    for (let i = 0; i < 8; i++) {
      items.push(item(`left line ${i} of the first column text`, 50, 700 - i * 14, 180, 'times'));
      items.push(item(`right line ${i} of the second column text`, 260, 700 - i * 14, 180, 'times'));
    }
    const text = layoutTextItems(items).text.replace(/\s+/g, ' ');
    expect(text.indexOf('left line 7')).toBeLessThan(text.indexOf('right line 0'));
  });

  it('drops text drawn several times on top of itself (fake bold)', () => {
    const items = [item('Seeking', 50, 700, 35, 'times'), item('Seeking', 50.3, 700, 35, 'times'), item('knowledge', 90, 700, 45, 'times')];
    expect(layoutTextItems(items).text).toBe('Seeking knowledge');
  });
});

describe('heading quality', () => {
  const body = (y: number) => item('ordinary body text of the page goes here', 50, y, 200, 'times', 10);
  it('ignores OCR noise that mixes scripts or has no real word', () => {
    const items = [item('SI EEE, ET — دا ally', 50, 700, 150, 'ocr', 18), item('h h', 50, 680, 20, 'ocr', 18), ...[0, 1, 2, 3, 4].map((i) => body(650 - i * 12))];
    expect(layoutTextItems(items).headingLines).toEqual([]);
  });
  it('keeps real headings', () => {
    const items = [item('Purity (Taharah)', 50, 700, 120, 'times', 18), ...[0, 1, 2, 3, 4].map((i) => body(650 - i * 12))];
    expect(layoutTextItems(items).headingLines.map((h) => h.text)).toEqual(['Purity (Taharah)']);
  });
});

describe('Surah headings', () => {
  it('recognises Surah banners as chapters', () => {
    expect(matchHeadingLine('(58) Sūrat al-Mujādilah')).toMatchObject({ kind: 'chapter', number: '58' });
    expect(matchHeadingLine('Surah Al-Fatiha')).toMatchObject({ kind: 'chapter' });
  });

  it('does not treat ordinary sentences as Surahs', () => {
    expect(matchHeadingLine('Sarah went to the market')?.kind).not.toBe('chapter');
  });

  it('normalises OCR spellings of the banner', () => {
    expect(normalizeSurahTitle('(64) Strat at-Taghabun')).toBe('Sūrat at-Taghabun');
    expect(normalizeSurahTitle('K 13 Srat al-Asr')).toBe('Sūrat al-Asr');
    expect(normalizeSurahTitle('_(58)Surat al-Mujadilah |')).toBe('Sūrat al-Mujadilah');
    expect(normalizeSurahTitle('(114) Surat an-Nas an-Nas')).toBe('Sūrat an-Nas');
  });
});
