import { describe, expect, it } from 'vitest';
import { layoutTextItems, type PdfTextItem } from './layout';
import { normalizePages } from './normalizer';
import { detectStructureFromPages, extractIntroductionText, structureToDetectedChapters } from './structureDetector';
import { runPipeline } from './pipeline';
import { parseBookContent } from '@/services/content/parseBookContent';
import { enrichContentBlocks } from '@/lib/readerContent';
import type { RawPage } from '@/lib/pdfExtractor';
import type { NormalizedPage } from './types';

/** PDF.js-like text item: font size 10, ~5 units per character. */
function item(str: string, x: number, y: number, size = 10, extra: Partial<PdfTextItem> = {}): PdfTextItem {
  return { str, transform: [size, 0, 0, size, x, y], width: str.length * size * 0.5, ...extra };
}

describe('layoutTextItems (PDF.js items → lines/paragraphs)', () => {
  it('does not insert spaces inside a word split into several items', () => {
    const { text } = layoutTextItems([item('Isl', 50, 700), item('am', 65, 700)]);
    expect(text).toBe('Islam');
  });

  it('inserts a space when items are separated by a real gap', () => {
    const { text } = layoutTextItems([item('Seeking', 50, 700), item('knowledge', 90, 700)]);
    expect(text).toBe('Seeking knowledge');
  });

  it('keeps items after an end-of-line marker on the same line', () => {
    const { text } = layoutTextItems([
      item('first part', 50, 700, 10, { hasEOL: true }),
      item('second part', 200, 700),
    ]);
    expect(text).toContain('second part');
  });

  it('emits a blank line for a large vertical gap (paragraph break)', () => {
    const { text } = layoutTextItems([
      item('Line one of the first paragraph', 50, 700),
      item('line two of the first paragraph.', 50, 688),
      item('A second paragraph begins here', 50, 650),
      item('and continues.', 50, 638),
    ]);
    expect(text.split('\n\n')).toHaveLength(2);
  });

  it('orders Arabic lines right-to-left', () => {
    // Visual order on the page: "الله" is right-most, so it comes first logically
    const { text } = layoutTextItems([
      item('الرحيم', 50, 700),
      item('الرحمن', 100, 700),
      item('الله', 150, 700),
      item('بسم', 200, 700),
    ]);
    expect(text).toBe('بسم الله الرحمن الرحيم');
  });

  it('reports larger-font lines as headings', () => {
    const body = Array.from({ length: 6 }, (_, i) =>
      item('Body text line that is long enough to set the median', 50, 650 - i * 12),
    );
    const { headingLines, text } = layoutTextItems([item('The Virtues of Patience', 50, 700, 18), ...body]);
    expect(headingLines).toEqual([{ text: 'The Virtues of Patience', level: 1, size: 18 }]);
    expect(text.startsWith('The Virtues of Patience\n\n')).toBe(true);
  });
});

function rawPage(pageNum: number, text: string, extra: Partial<RawPage> = {}): RawPage {
  return { pageNum, text, ...extra };
}

describe('normalizePages', () => {
  it('keeps paragraphs separate instead of fusing a whole page', () => {
    const pages = normalizePages([
      rawPage(1, 'First paragraph sentence one.\nStill the first paragraph.\n\nSecond paragraph here.'),
    ]);
    const texts = pages[0].blocks.filter((b) => b.type === 'text').map((b) => b.text);
    expect(texts).toEqual(['First paragraph sentence one. Still the first paragraph.', 'Second paragraph here.']);
  });

  it('joins a paragraph that continues across a page break', () => {
    const pages = normalizePages([
      rawPage(1, 'The scholars agreed that the prayer'),
      rawPage(2, 'is obligatory upon every adult Muslim.'),
    ]);
    const all = pages.flatMap((p) => p.blocks.map((b) => b.text));
    expect(all).toContain('The scholars agreed that the prayer is obligatory upon every adult Muslim.');
  });

  it('treats dash bullets as list items, not quotes', () => {
    const pages = normalizePages([rawPage(1, '- Prayer\n- Fasting\n- Charity')]);
    expect(pages[0].blocks.every((b) => b.type === 'list')).toBe(true);
  });

  it('keeps years / numbers inside the text but drops page numbers', () => {
    const pages = normalizePages([
      rawPage(1, 'He died in the year\n\n1350\n\nafter a long life.\n\n12'),
    ]);
    const all = pages.flatMap((p) => p.blocks.map((b) => b.text)).join(' ');
    expect(all).toContain('1350');
    expect(all).not.toMatch(/\b12\b/);
  });

  it('marks large-font lines as heading candidates', () => {
    const pages = normalizePages([
      rawPage(2, 'The Virtues of Patience\n\nBody text.', {
        headingLines: [{ text: 'The Virtues of Patience', level: 1 }],
      }),
    ]);
    expect(pages[0].blocks[0]).toMatchObject({ type: 'possible-heading', headingLevel: 1 });
  });
});

function page(n: number, blocks: NormalizedPage['blocks']): NormalizedPage {
  return { pageNumber: n, blocks };
}

describe('structure detection', () => {
  it('does not drop text that follows a demoted ALL-CAPS line', () => {
    const nodes = detectStructureFromPages([
      page(1, [
        { text: 'Chapter 1 Faith', type: 'possible-heading' },
        { text: 'Opening text of chapter one.', type: 'text', confidence: 'high' },
        { text: 'SOME CAPS LINE', type: 'possible-heading' },
        { text: 'Important text that must not vanish.', type: 'text', confidence: 'high' },
      ]),
    ]);
    const chapters = structureToDetectedChapters(nodes, []);
    const all = chapters.flatMap((c) => c.sections.map((s) => s.rawText)).join('\n');
    expect(all).toContain('Important text that must not vanish.');
  });

  it('skips table-of-contents entries instead of creating empty chapters', () => {
    const toc = page(1, [
      { text: 'Chapter 1 Faith ........ 5', type: 'possible-heading' },
      { text: 'Chapter 2 Prayer ........ 12', type: 'possible-heading' },
      { text: 'Chapter 3 Fasting ........ 20', type: 'possible-heading' },
      { text: 'Chapter 4 Charity ........ 31', type: 'possible-heading' },
    ]);
    const body = page(2, [
      { text: 'Chapter 1 Faith', type: 'possible-heading' },
      { text: 'Body of chapter one.', type: 'text', confidence: 'high' },
    ]);
    const chapters = structureToDetectedChapters(detectStructureFromPages([toc, body]), []);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toBe('Faith');
  });

  it('ignores a running header that repeats the open chapter heading', () => {
    const nodes = detectStructureFromPages([
      page(1, [
        { text: 'Chapter 3 Prayer', type: 'possible-heading' },
        { text: 'Page one text.', type: 'text', confidence: 'high' },
      ]),
      page(2, [
        { text: 'Chapter 3 Prayer', type: 'possible-heading' },
        { text: 'Page two text.', type: 'text', confidence: 'high' },
      ]),
    ]);
    expect(nodes.filter((n) => n.kind === 'chapter')).toHaveLength(1);
  });

  it('uses text before the first chapter as the introduction', () => {
    const nodes = detectStructureFromPages([
      page(1, [{ text: `Opening words of the author. ${'He explains why this book was written and how to read it. '.repeat(4)}`, type: 'text', confidence: 'high' }]),
      page(2, [
        { text: 'Chapter 1 Faith', type: 'possible-heading' },
        { text: 'Body.', type: 'text', confidence: 'high' },
      ]),
    ]);
    expect(extractIntroductionText(nodes)).toContain('Opening words of the author.');
  });

  it('turns a large-font line into a chapter without a "Chapter N" pattern', () => {
    const nodes = detectStructureFromPages([
      page(1, [{ text: 'Title page', type: 'text', confidence: 'high' }]),
      page(2, [
        { text: 'The Virtues of Patience', type: 'possible-heading', headingLevel: 1 },
        { text: 'Body.', type: 'text', confidence: 'high' },
      ]),
    ]);
    const chapter = nodes.find((n) => n.kind === 'chapter');
    expect(chapter?.title).toBe('The Virtues of Patience');
  });
});

describe('reader text is not rewritten', () => {
  it("keeps the space before an apostrophe in names like Ibn 'Abbas", () => {
    const blocks = enrichContentBlocks([{ type: 'paragraph', text: "It was narrated from Ibn 'Abbas that he said so." }]);
    expect(blocks[0]).toMatchObject({ text: "It was narrated from Ibn 'Abbas that he said so." });
  });

  it('does not split a long paragraph into chunks', () => {
    const long = Array.from({ length: 30 }, (_, i) => `Sentence number ${i + 1} of the paragraph.`).join(' ');
    const blocks = enrichContentBlocks(parseBookContent(long));
    expect(blocks).toHaveLength(1);
  });

  it('keeps "Quran is…" prose as a paragraph, not a reference', () => {
    const blocks = parseBookContent('Quran is the word of Allah revealed to the Prophet.');
    expect(blocks[0].type).toBe('paragraph');
  });

  it('marks Urdu / Arabic paragraphs as right-to-left', () => {
    const blocks = enrichContentBlocks([{ type: 'paragraph', text: 'یہ کتاب اسلامی تعلیمات کے بارے میں ہے' }]);
    expect(blocks[0]).toMatchObject({ direction: 'rtl' });
  });
});

describe('pipeline end to end', () => {
  it('keeps every paragraph of a simple book', () => {
    const book = runPipeline(
      [
        rawPage(1, 'A Short Book\n\nBy An Author'),
        rawPage(2, 'Chapter 1 Faith\n\nFaith is belief in the heart.\n\nIt increases with good deeds.'),
        rawPage(3, 'Chapter 2 Prayer\n\nPrayer is the pillar of the religion.'),
      ],
      'short.pdf',
    );
    const all = book.chapters.flatMap((c) => c.sections.map((s) => s.rawText)).join('\n');
    expect(book.chapters.map((c) => c.title)).toEqual(['Faith', 'Prayer']);
    expect(all).toContain('Faith is belief in the heart.');
    expect(all).toContain('It increases with good deeds.');
    expect(all).toContain('Prayer is the pillar of the religion.');
  });
});
