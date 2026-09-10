import { describe, expect, it } from 'vitest';
import type { ContentBlock } from '@/types';
import { parseBookContent } from '@/services/content/parseBookContent';
import { htmlToContentBlocks } from '@/lib/bookTransform';
import { segmentDenseText } from '@/services/content/segmentDenseText';
import { validateBookPdfFile, MAX_BOOK_PDF_SIZE_MB } from '@/lib/uploadLimits';

describe('dense PDF blob parsing (real import failure mode)', () => {
  it('segments space-joined Arabic + English + Qur\'an reference', () => {
    const blob =
      'Tawheed is the foundation. وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ And establish prayer and give zakah. Qur\'an 2:43 The scholars explained this.';
    const parts = segmentDenseText(blob);
    expect(parts.length).toBeGreaterThan(2);
    expect(parts.some((p) => /[\u0600-\u06FF]/.test(p))).toBe(true);

    const blocks = parseBookContent(blob);
    expect(blocks.some((b: ContentBlock) => b.type === 'quran' || b.type === 'arabic')).toBe(true);
  });

  it('htmlToContentBlocks re-parses dense <p> blobs from stored imports', () => {
    const html =
      "<p>CHAPTER ONE The Importance of Tawheed Tawheed is essential. الحمد لله رب العالمين All praise is due to Allah. Qur'an 1:2 Narrated Abu Hurairah The Messenger of Allah said Actions are by intentions. Sahih al-Bukhari</p>";
    const blocks = htmlToContentBlocks(html);
    const types = blocks.map((b) => b.type);
    expect(types.some((t) => t === 'arabic' || t === 'quran')).toBe(true);
  });

  it('does not classify volume/page prose as Qur\'an', () => {
    const blocks = parseBookContent('See volume 2, page 43 for details.');
    expect(blocks.every((b: ContentBlock) => b.type === 'paragraph')).toBe(true);
  });

  it('does not classify section 2:43 discussion as Qur\'an', () => {
    const blocks = parseBookContent('The answer is found in section 2:43 of the discussion.');
    expect(blocks.some((b: ContentBlock) => b.type === 'quran')).toBe(false);
  });
});

describe('upload limits', () => {
  it('exposes a single max size of 20 MB', () => {
    expect(MAX_BOOK_PDF_SIZE_MB).toBe(20);
  });

  it('rejects oversized PDFs with a clear message', () => {
    const big = {
      name: 'big.pdf',
      type: 'application/pdf',
      size: 21 * 1024 * 1024,
    } as File;
    const result = validateBookPdfFile(big);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/20 MB/);
    }
  });

  it('accepts a normal PDF under the limit', () => {
    const ok = {
      name: 'book.pdf',
      type: 'application/pdf',
      size: 1024,
    } as File;
    expect(validateBookPdfFile(ok).ok).toBe(true);
  });
});
