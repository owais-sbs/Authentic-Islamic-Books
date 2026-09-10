import type { DetectedChapter, DetectedSection } from '@/lib/pdfExtractor';

/**
 * Normalize a chapter title so it doesn't repeat a wrong/stale chapter number
 * (e.g. OCR turned "Chapter 11" into number "1" while title still says "Chapter 1").
 */
function cleanChapterTitle(title: string, chapterNumber: string): string {
  const t = title.trim();
  if (!t) return `Chapter ${chapterNumber}`;

  // Title is only a bare number (often a parse artifact) → use standard label
  if (/^\d+(\.\d+)*$/.test(t)) {
    return `Chapter ${chapterNumber}`;
  }

  // "Chapter 1" / "Chapter 01" / "Chapter XI" with no real title → renumber
  if (/^(chapter|part|lesson|unit|book)\s+(\d+|[ivxlcdm]+)\s*$/i.test(t)) {
    return `Chapter ${chapterNumber}`;
  }

  // "Chapter 1 — Real Title" / "Chapter 1: Real Title" → keep title, drop stale number
  const stripped = t
    .replace(/^(chapter|part|lesson|unit|book)\s+(\d+|[ivxlcdm]+)\s*[:\-–—]\s*/i, '')
    .trim();
  if (stripped && stripped !== t) {
    return stripped;
  }

  return t;
}

function isGenericSectionTitle(title: string): boolean {
  const t = title.trim();
  return (
    !t ||
    /^content$/i.test(t) ||
    /^section\s*[\d.]+$/i.test(t) ||
    /^\d+(\.\d+)*$/.test(t)
  );
}

function renumberSections(sections: DetectedSection[], chapterIndex: number): DetectedSection[] {
  return sections.map((sec, si) => {
    const autoNumber = sections.length === 1 ? String(chapterIndex) : `${chapterIndex}.${si + 1}`;
    const title = isGenericSectionTitle(sec.title || '') ? 'Content' : sec.title.trim();

    return {
      ...sec,
      number: autoNumber,
      title,
    };
  });
}

/**
 * Apply consistent chapter/section numbering from hierarchy order.
 * Always uses 1…N by position — never trust OCR/extracted numbers
 * (those often collapse "11" → "1" after chapter 10).
 */
export function applyAutomaticNumbering(chapters: DetectedChapter[]): DetectedChapter[] {
  return chapters.map((ch, ci) => {
    if (ch.title === 'Unstructured Content') {
      return {
        ...ch,
        number: '1',
        sections: ch.sections.map((sec) => ({
          ...sec,
          number: sec.number || '1',
          title: sec.title || 'Content',
        })),
      };
    }

    const chapterNumber = String(ci + 1);
    const sections = renumberSections(ch.sections, ci + 1);

    return {
      ...ch,
      number: chapterNumber,
      title: cleanChapterTitle(ch.title || '', chapterNumber),
      sections,
    };
  });
}
