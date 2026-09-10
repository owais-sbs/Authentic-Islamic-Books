import { describe, expect, it } from 'vitest';
import { detectLanguage, directionForLanguage } from './language';
import { detectDocumentType, pageHasUsableText } from './documentType';
import { matchHeadingLine, structureToDetectedChapters } from './structureDetector';
import { structureToMarkdown, markdownToStructure } from './markdown';
import { validateBookPdfFile, MAX_PDF_SIZE } from '@/lib/uploadLimits';
import type { NormalizedPage } from './types';
import { detectStructureFromPages } from './structureDetector';

describe('upload limit', () => {
  it('enforces 20 MB in bytes', () => {
    expect(MAX_PDF_SIZE).toBe(20 * 1024 * 1024);
  });

  it('rejects files over 20 MB', () => {
    const big = new File([new ArrayBuffer(MAX_PDF_SIZE + 1)], 'big.pdf', {
      type: 'application/pdf',
    });
    const result = validateBookPdfFile(big);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('20 MB');
    }
  });

  it('accepts files at or under 20 MB', () => {
    const ok = new File([new ArrayBuffer(1024)], 'ok.pdf', { type: 'application/pdf' });
    expect(validateBookPdfFile(ok).ok).toBe(true);
  });
});

describe('language detection', () => {
  it('detects English LTR', () => {
    expect(detectLanguage('The importance of seeking knowledge in Islam.')).toBe('en');
    expect(directionForLanguage('en')).toBe('ltr');
  });

  it('detects Arabic RTL', () => {
    expect(detectLanguage('الحمد لله رب العالمين')).toBe('ar');
    expect(directionForLanguage('ar')).toBe('rtl');
  });

  it('detects Urdu RTL', () => {
    expect(detectLanguage('تمام تعریفیں اللہ کے لیے ہیں جو رب العالمین ہے')).toBe('ur');
    expect(directionForLanguage('ur')).toBe('rtl');
  });
});

describe('structure detection', () => {
  it('detects English chapter headings', () => {
    const h = matchHeadingLine('Chapter 1 — The Importance of Knowledge');
    expect(h?.kind).toBe('chapter');
    expect(h?.confidence).toBe('high');
  });

  it('detects Arabic chapter headings', () => {
    const h = matchHeadingLine('الباب الأول في فضل العلم');
    expect(h?.kind).toBe('chapter');
  });

  it('detects Urdu chapter headings', () => {
    const h = matchHeadingLine('باب اول علم کی فضیلت');
    expect(h?.kind).toBe('chapter');
  });

  it('does not invent page-based chapters when no headings exist', () => {
    const pages: NormalizedPage[] = Array.from({ length: 20 }, (_, i) => ({
      pageNumber: i + 1,
      blocks: [
        {
          text: `This is scholarly paragraph number ${i + 1} about knowledge and practice in the religion.`,
          type: 'text' as const,
          confidence: 'high' as const,
        },
      ],
    }));
    const nodes = detectStructureFromPages(pages);
    const chapters = structureToDetectedChapters(nodes, pages);
    expect(chapters.length).toBe(1);
    expect(chapters[0].title).toBe('Unstructured Content');
    expect(chapters[0].sections.length).toBe(1);
    expect(chapters[0].sections[0].title).toBe('Content');
  });
});

describe('document type', () => {
  it('marks empty pages as unscanned-text', () => {
    expect(pageHasUsableText('12')).toBe(false);
    expect(pageHasUsableText('A full paragraph of meaningful extractable book content here.')).toBe(
      true,
    );
  });

  it('detects scanned documents', () => {
    const result = detectDocumentType([
      { pageNum: 1, text: '' },
      { pageNum: 2, text: '3' },
      { pageNum: 3, text: '' },
    ]);
    expect(result.documentType).toBe('scanned');
    expect(result.warnings.some((w) => /OCR/i.test(w))).toBe(true);
  });

  it('notes when OCR recovered scanned pages', () => {
    const result = detectDocumentType(
      [
        { pageNum: 1, text: 'Recovered paragraph about knowledge in Islam with enough words.', fromOcr: true },
        { pageNum: 2, text: 'Another recovered paragraph of scholarly content for testing.', fromOcr: true },
      ],
      { ocrPageNums: [1, 2], ocrFailedPageNums: [] },
    );
    expect(result.textPageCount).toBe(2);
    expect(result.warnings.some((w) => /OCR applied/i.test(w))).toBe(true);
    expect(result.warnings.some((w) => /require OCR/i.test(w))).toBe(false);
  });
});

describe('markdown IR', () => {
  it('round-trips chapters through controlled markdown', () => {
    const md = structureToMarkdown({
      meta: { title: 'Book of Knowledge', author: 'Imam Example', description: '' },
      languages: ['en'],
      documentType: 'text',
      pageCount: 10,
      introductionText: 'Intro text.',
      chapters: [
        {
          number: '1',
          title: 'Foundations',
          description: '',
          rawText: '',
          sections: [{ number: '1.1', title: 'Seeking', rawText: 'Seek knowledge.' }],
        },
      ],
    });
    expect(md).toContain('# BOOK: Book of Knowledge');
    expect(md).toContain('## CHAPTER 1 — Foundations');
    const parsed = markdownToStructure(md);
    expect(parsed.meta.title).toBe('Book of Knowledge');
    expect(parsed.chapters[0].title).toBe('Foundations');
    expect(parsed.chapters[0].sections[0].rawText).toContain('Seek knowledge');
  });

  it('preserves double-digit chapter numbers (10, 11, 12) in markup', () => {
    const chapters = Array.from({ length: 12 }, (_, i) => ({
      number: String(i + 1),
      title: `Title ${i + 1}`,
      description: '',
      rawText: '',
      sections: [{ number: `${i + 1}.1`, title: 'Sec', rawText: `body ${i + 1}` }],
    }));
    const md = structureToMarkdown({
      meta: { title: 'Long Book', author: '', description: '' },
      languages: ['en'],
      introductionText: '',
      chapters,
    });
    expect(md).toContain('## CHAPTER 10 — Title 10');
    expect(md).toContain('## CHAPTER 11 — Title 11');
    expect(md).toContain('## CHAPTER 12 — Title 12');
    const parsed = markdownToStructure(md);
    expect(parsed.chapters.map((c) => c.number)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(i + 1)),
    );
  });

  it('still parses legacy CHAPTER N: Title markup', () => {
    const parsed = markdownToStructure(`# BOOK: Legacy
## CHAPTER 11: Legacy Title
### SECTION 11.1: Body
Text here.
`);
    expect(parsed.chapters[0].number).toBe('11');
    expect(parsed.chapters[0].title).toBe('Legacy Title');
  });
});

describe('automatic numbering', () => {
  it('forces sequential numbers even when OCR collapses 11 → 1', async () => {
    const { applyAutomaticNumbering } = await import('./numbering');
    const chapters = Array.from({ length: 12 }, (_, i) => ({
      // Simulate OCR losing the tens digit after chapter 10
      number: i < 10 ? String(i + 1) : '1',
      title: i < 10 ? `Title ${i + 1}` : `Chapter 1 — Title ${i + 1}`,
      description: '',
      rawText: '',
      sections: [{ number: '1', title: 'Content', rawText: 'body' }],
    }));
    const numbered = applyAutomaticNumbering(chapters);
    expect(numbered.map((c) => c.number)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(i + 1)),
    );
    expect(numbered[10].number).toBe('11');
    expect(numbered[10].title).toBe('Title 11');
    expect(numbered[11].number).toBe('12');
  });
});
