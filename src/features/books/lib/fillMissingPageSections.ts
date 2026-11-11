import type { BookSection } from '../types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * If sections are titled "Page N" with gaps (e.g. 10, 11, 13), insert empty
 * placeholder sections for the missing pages so Arabic/OCR-failed pages are
 * not lost from the review list.
 */
export function fillMissingPageSections(
  sections: BookSection[],
  chapterId: string,
): { sections: BookSection[]; inserted: number } {
  const pageOf = (s: BookSection): number | null => {
    const fromTitle = /^Page\s+(\d+)$/i.exec((s.title || '').trim());
    if (fromTitle) return Number(fromTitle[1]);
    if (s.pdfPageStart != null && Number.isFinite(s.pdfPageStart)) return s.pdfPageStart;
    const n = Number(s.number);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const tagged = sections
    .map((s) => ({ s, page: pageOf(s) }))
    .filter((x): x is { s: BookSection; page: number } => x.page != null);

  // Only repair when most sections look like PDF pages
  if (tagged.length < 2 || tagged.length < sections.length * 0.6) {
    return { sections, inserted: 0 };
  }

  const byPage = new Map<number, BookSection>();
  for (const { s, page } of tagged) {
    if (!byPage.has(page)) byPage.set(page, s);
  }

  const maxPage = Math.max(...byPage.keys());
  const minPage = Math.min(...byPage.keys());
  if (maxPage - minPage + 1 <= byPage.size) {
    return { sections, inserted: 0 }; // already contiguous
  }

  const filled: BookSection[] = [];
  let inserted = 0;
  for (let p = minPage; p <= maxPage; p++) {
    const existing = byPage.get(p);
    if (existing) {
      filled.push({
        ...existing,
        number: String(p),
        title: existing.title?.trim() || `Page ${p}`,
        pdfPageStart: existing.pdfPageStart ?? p,
        pdfPageEnd: existing.pdfPageEnd ?? p,
        order: filled.length,
      });
    } else {
      inserted += 1;
      filled.push({
        id: generateId(),
        chapterId,
        number: String(p),
        title: `Page ${p}`,
        content:
          `<p dir="rtl" lang="ar" class="content-arabic">[Page ${p} — missing after extraction. Paste Arabic / English for this page here.]</p>`,
        order: filled.length,
        pdfPageStart: p,
        pdfPageEnd: p,
      });
    }
  }

  // Keep any non-page sections after the page run
  const nonPage = sections.filter((s) => pageOf(s) == null);
  return { sections: [...filled, ...nonPage], inserted };
}
