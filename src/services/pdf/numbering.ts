import type { DetectedChapter, DetectedSection } from '@/lib/pdfExtractor';

function hasReliableNumber(value: string): boolean {
  return /^\d+(\.\d+)*$/.test(value.trim());
}

function renumberSections(sections: DetectedSection[], chapterIndex: number): DetectedSection[] {
  return sections.map((sec, si) => {
    const autoNumber = `${chapterIndex}.${si + 1}`;
    return {
      ...sec,
      number: hasReliableNumber(sec.number) ? sec.number : autoNumber,
      title: sec.title || `Section ${autoNumber}`,
    };
  });
}

/** Apply consistent chapter/section numbering from hierarchy order. */
export function applyAutomaticNumbering(chapters: DetectedChapter[]): DetectedChapter[] {
  return chapters.map((ch, ci) => {
    const chapterNumber = hasReliableNumber(ch.number) ? ch.number : String(ci + 1);
    const sections = renumberSections(ch.sections, ci + 1);

    return {
      ...ch,
      number: chapterNumber,
      title: ch.title || `Chapter ${chapterNumber}`,
      sections,
    };
  });
}
