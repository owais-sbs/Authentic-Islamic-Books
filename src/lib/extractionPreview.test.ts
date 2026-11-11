import { describe, expect, it } from 'vitest';
import { buildPageReports } from './extractionPreview';
import type { RawPage } from './pdfExtractor';

describe('buildPageReports', () => {
  it('marks empty pages and reports unavailable OCR confidence', () => {
    const pages: RawPage[] = [
      { pageNum: 1, text: '', fromOcr: false, requiresOcr: true },
      {
        pageNum: 2,
        text: 'Hello world. This is enough English text for a page.',
        fromOcr: true,
        ocrConfidence: null,
      },
    ];
    const reports = buildPageReports(pages);
    expect(reports[0].emptyOrThin).toBe(true);
    expect(reports[0].needsManualReview).toBe(true);
    expect(reports[0].ocrConfidence).toBeNull();
    expect(reports[1].usedOcr).toBe(true);
    expect(reports[1].ocrConfidence).toBeNull();
    expect(reports[1].warnings.some((w) => /confidence unavailable/i.test(w))).toBe(true);
  });

  it('detects near-duplicate consecutive pages', () => {
    const body =
      'Prophet Muhammad taught prayer with care and consistency across many reports.';
    const pages: RawPage[] = [
      { pageNum: 1, text: body },
      { pageNum: 2, text: body },
    ];
    const reports = buildPageReports(pages);
    expect(reports[1].duplicateOfPreviousPage).toBe(true);
    expect(reports[1].needsManualReview).toBe(true);
  });

  it('rounds finite OCR confidence and leaves others unavailable', () => {
    const pages: RawPage[] = [
      { pageNum: 1, text: 'Sample page with enough characters here.', fromOcr: true, ocrConfidence: 87.654 },
    ];
    const reports = buildPageReports(pages);
    expect(reports[0].ocrConfidence).toBe(87.7);
  });
});
