import type { Book, ContentBlock } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';

export type ReaderUnit = {
  id: string;
  index: number;
  displayNumber: string;
  title: string;
  content: ContentBlock[];
  chapterTitle?: string;
};

function isGenericTitle(title: string): boolean {
  const t = title.trim();
  return (
    /^chapter\s*\d+$/i.test(t) ||
    /^section\s*[\d.]+$/i.test(t) ||
    /^part\s*\d+$/i.test(t) ||
    t.toLowerCase() === 'chapter 1' ||
    /^chapter\s+\d+\s*[-—]\s*chapter\s+\d+$/i.test(t)
  );
}

function titleFromContent(content: ContentBlock[]): string | null {
  for (const block of content) {
    if (block.type === 'heading' && block.text.trim()) return block.text.trim();
    if (block.type === 'paragraph') {
      const hadith = block.text.match(/\bThe\s+(?:First|Second|Third|Fourth|Fifth|\d+(?:st|nd|rd|th)?)\s+Hadith\b/i);
      if (hadith) return hadith[0];
    }
  }
  return null;
}

function displayTitle(sectionTitle: string, chapterTitle: string, index: number, content: ContentBlock[]): string {
  const fromContent = titleFromContent(content);
  if (fromContent) return fromContent;
  if (!isGenericTitle(sectionTitle)) return sectionTitle;
  if (!isGenericTitle(chapterTitle) && chapterTitle !== sectionTitle) return chapterTitle;
  return index === 0 ? 'Introduction' : `Reading ${index + 1}`;
}

function collectSectionUnits(
  section: {
    id: string;
    number: string;
    title: string;
    content?: ContentBlock[];
    subsections?: { id: string; number: string; title: string; content?: ContentBlock[] }[];
  },
  chapterTitle: string,
  units: ReaderUnit[],
): void {
  if (section.subsections?.length) {
    for (const sub of section.subsections) {
      if (sub.content?.length) {
        const content = enrichContentBlocks(sub.content);
        if (content.length === 0) continue;
        units.push({
          id: sub.id,
          index: units.length,
          displayNumber: String(units.length + 1),
          title: displayTitle(sub.title, chapterTitle, units.length, content),
          content,
          chapterTitle: isGenericTitle(chapterTitle) ? undefined : chapterTitle,
        });
      }
    }
    return;
  }

  if (section.content?.length) {
    const content = enrichContentBlocks(section.content);
    if (content.length === 0) return;
    units.push({
      id: section.id,
      index: units.length,
      displayNumber: String(units.length + 1),
      title: displayTitle(section.title, chapterTitle, units.length, content),
      content,
      chapterTitle: isGenericTitle(chapterTitle) ? undefined : chapterTitle,
    });
  }
}

/** Flatten a book into sequential reading pages (intro → sections). */
export function getReaderUnits(book: Book): ReaderUnit[] {
  const units: ReaderUnit[] = [];

  if (book.introduction?.length) {
    const content = enrichContentBlocks(book.introduction);
    if (content.length > 0) {
      units.push({
        id: 'introduction',
        index: 0,
        displayNumber: '1',
        title: 'Introduction',
        content,
      });
    }
  }

  for (const chapter of book.chapters) {
    const chapterLabel = chapter.title || `Chapter ${chapter.number}`;
    if (chapter.sections.length === 0) continue;
    for (const section of chapter.sections) {
      collectSectionUnits(section, chapterLabel, units);
    }
  }

  return units.map((unit, index) => ({
    ...unit,
    index,
    displayNumber: String(index + 1),
  }));
}

export function findUnitIndex(units: ReaderUnit[], sectionId: string | null): number {
  if (!sectionId) return 0;
  const idx = units.findIndex((unit) => unit.id === sectionId);
  return idx >= 0 ? idx : 0;
}
