import type { DetectedChapter, DetectedSection } from '@/lib/pdfExtractor';

function hasReliableNumber(value: string): boolean {
  return /^\d+(\.\d+)*$/.test(value.trim());
}

function renumberSections(sections: DetectedSection[], chapterIndex: number): DetectedSection[] {
  return sections.map((sec, si) => {
    const autoNumber = `${chapterIndex}.${si + 1}`;
    // Keep "Content" / empty titles — do not invent "Section 1.1"
    const title =
      sec.title?.trim() && sec.title.trim().toLowerCase() !== `section ${autoNumber}`.toLowerCase()
        ? sec.title
        : sec.title === 'Content' || !sec.title
          ? sec.title || 'Content'
          : sec.title;

    return {
      ...sec,
      number: hasReliableNumber(sec.number) ? sec.number : sections.length === 1 ? String(chapterIndex) : autoNumber,
      title,
    };
  });
}

/** Apply consistent chapter/section numbering from hierarchy order. */
export function applyAutomaticNumbering(chapters: DetectedChapter[]): DetectedChapter[] {
  return chapters.map((ch, ci) => {
    if (ch.title === 'Unstructured Content') {
      return {
        ...ch,
        number: ch.number || '1',
        sections: ch.sections.map((sec) => ({
          ...sec,
          number: sec.number || '1',
          title: sec.title || 'Content',
        })),
      };
    }

    const chapterNumber = hasReliableNumber(ch.number) ? ch.number : String(ci + 1);
    const sections = renumberSections(ch.sections, Number(chapterNumber) || ci + 1);

    return {
      ...ch,
      number: chapterNumber,
      title: ch.title || `Chapter ${chapterNumber}`,
      sections,
    };
  });
}
