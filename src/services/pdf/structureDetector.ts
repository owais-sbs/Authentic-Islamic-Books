import type { DetectedChapter, DetectedMeta, DetectedSection } from '@/lib/pdfExtractor';
import type { NormalizedBlock, NormalizedPage, StructureNode } from './types';

const EXPLICIT_CHAPTER = [
  /^chapter\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,100})$/i,
  /^part\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,100})$/i,
  /^book\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,100})$/i,
  /^lesson\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,100})$/i,
];

const NUMBERED_CHAPTER = /^(\d{1,3})\s*[:\-–—.]\s+([A-Z\u0600-\u06FF].{2,90})$/;
const SECTION_LINE = /^(\d+\.\d+(?:\.\d+)?)\s*[:\-–—.]?\s*(.{2,90})$/;
const ROMAN = /^([IVXLC]+)\s*[:\-–—.]?\s*(.{2,90})$/i;

const INTRO_KEYWORDS = /^(introduction|preface|foreword|prologue)\b/i;

function matchChapter(line: string): { num: string; title: string; confidence: StructureNode['confidence'] } | null {
  for (const pat of EXPLICIT_CHAPTER) {
    const m = pat.exec(line);
    if (m) return { num: m[1] || '', title: (m[2] || '').trim(), confidence: 'high' };
  }
  const num = NUMBERED_CHAPTER.exec(line);
  if (num) return { num: num[1], title: num[2].trim(), confidence: 'high' };
  const roman = ROMAN.exec(line);
  if (roman && line.length < 90) return { num: roman[1], title: roman[2].trim(), confidence: 'medium' };
  if (line.length <= 70 && line === line.toUpperCase() && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 10) {
    return { num: '', title: line, confidence: 'medium' };
  }
  return null;
}

function matchSection(line: string, chapterNum: string): { num: string; title: string; confidence: StructureNode['confidence'] } | null {
  const m = SECTION_LINE.exec(line);
  if (m) return { num: m[1], title: m[2].trim(), confidence: 'high' };
  if (INTRO_KEYWORDS.test(line) && line.length < 60) {
    return { num: `${chapterNum}.0`, title: line.replace(/[.:]+$/, ''), confidence: 'high' };
  }
  if (line.length <= 55 && /^[A-Z]/.test(line) && line.split(/\s+/).length <= 8 && !line.endsWith('.')) {
    return { num: '', title: line, confidence: 'low' };
  }
  return null;
}

export function detectStructureFromPages(pages: NormalizedPage[]): StructureNode[] {
  const nodes: StructureNode[] = [];
  let currentChapter: StructureNode | null = null;
  let currentSection: StructureNode | null = null;

  const pushParagraph = (text: string, type: NormalizedBlock['type'] = 'text') => {
    if (!text.trim()) return;
    const node: StructureNode = {
      kind: type === 'quote' ? 'quote' : type === 'list' ? 'list' : 'paragraph',
      content: text.trim(),
      confidence: 'high',
    };
    if (currentSection) {
      currentSection.children = currentSection.children ?? [];
      currentSection.children.push(node);
    } else if (currentChapter) {
      currentChapter.children = currentChapter.children ?? [];
      currentChapter.children.push(node);
    } else {
      nodes.push(node);
    }
  };

  const startChapter = (num: string, title: string, confidence: StructureNode['confidence']) => {
    currentSection = null;
    currentChapter = {
      kind: 'chapter',
      title: title || `Chapter ${num || nodes.filter((n) => n.kind === 'chapter').length + 1}`,
      content: num,
      confidence,
      children: [],
    };
    nodes.push(currentChapter);
  };

  const startSection = (num: string, title: string, confidence: StructureNode['confidence']) => {
    if (!currentChapter) {
      startChapter('1', 'Chapter 1', 'low');
    }
    const chapter = currentChapter as StructureNode;
    currentSection = {
      kind: 'section',
      title,
      content: num,
      confidence,
      children: [],
    };
    chapter.children = chapter.children ?? [];
    chapter.children.push(currentSection);
  };

  const activeChapterNum = (): string => {
    if (currentChapter?.kind === 'chapter') return currentChapter.content || '1';
    return String(nodes.filter((n) => n.kind === 'chapter').length || 1);
  };

  for (const page of pages) {
    for (const block of page.blocks) {
      const line = block.text.trim();
      if (!line) continue;

      if (block.type === 'possible-heading') {
        const ch = matchChapter(line);
        if (ch) {
          startChapter(ch.num, ch.title || line, ch.confidence);
          continue;
        }
        const sec = matchSection(line, activeChapterNum());
        if (sec && sec.confidence !== 'low') {
          startSection(sec.num, sec.title, sec.confidence);
          continue;
        }
      }

      const ch = matchChapter(line);
      if (ch) {
        startChapter(ch.num, ch.title || line, ch.confidence);
        continue;
      }

      if (currentChapter) {
        const sec = matchSection(line, activeChapterNum());
        if (sec && (sec.confidence === 'high' || (sec.confidence === 'medium' && line.length < 45))) {
          startSection(sec.num, sec.title, sec.confidence);
          continue;
        }
      }

      pushParagraph(line, block.type);
    }
  }

  return nodes;
}

export function structureToDetectedChapters(nodes: StructureNode[], pages: NormalizedPage[]): DetectedChapter[] {
  const chapterNodes = nodes.filter((n) => n.kind === 'chapter');
  if (chapterNodes.length > 0) {
    return chapterNodes.map((ch, ci) => {
      const sections = (ch.children ?? [])
        .filter((c) => c.kind === 'section')
        .map((sec, si) => ({
          number: sec.content || `${ci + 1}.${si + 1}`,
          title: sec.title || `Section ${si + 1}`,
          rawText: collectText(sec.children ?? []),
        }));

      const bodyParagraphs = (ch.children ?? []).filter((c) => c.kind === 'paragraph' || c.kind === 'quote' || c.kind === 'list');
      const chapterBody = collectText(bodyParagraphs);
      const sectionList = sections.length > 0
        ? sections
        : splitByWordCount(chapterBody || collectText(ch.children ?? []), String(ci + 1));

      return {
        number: ch.content || String(ci + 1),
        title: ch.title || `Chapter ${ci + 1}`,
        description: '',
        rawText: chapterBody,
        sections: sectionList,
      };
    });
  }

  const PAGES_PER_CHAPTER = 5;
  const numChapters = Math.max(1, Math.ceil(pages.length / PAGES_PER_CHAPTER));
  const chapters: DetectedChapter[] = [];

  for (let ci = 0; ci < numChapters; ci++) {
    const chunkPages = pages.slice(ci * PAGES_PER_CHAPTER, (ci + 1) * PAGES_PER_CHAPTER);
    const rawText = chunkPages.flatMap((p) => p.blocks.map((b) => b.text)).join('\n');
    if (!rawText.trim()) continue;
    chapters.push({
      number: String(ci + 1),
      title: `Chapter ${ci + 1}`,
      description: '',
      rawText,
      sections: splitByWordCount(rawText, String(ci + 1)),
    });
  }

  return chapters;
}

function collectText(nodes: StructureNode[]): string {
  return nodes.map((n) => n.content).join('\n\n');
}

function splitByWordCount(text: string, chapterNum: string): DetectedSection[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const WORDS_PER_SECTION = 400;
  const numSections = Math.min(20, Math.max(1, Math.round(words.length / WORDS_PER_SECTION)));
  const chunkSize = Math.ceil(words.length / numSections);
  const sections: DetectedSection[] = [];

  for (let i = 0; i < numSections; i++) {
    const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
    if (chunk.trim()) {
      sections.push({
        number: `${chapterNum}.${i + 1}`,
        title: `Section ${chapterNum}.${i + 1}`,
        rawText: chunk,
      });
    }
  }
  return sections;
}

export function detectMetaFromText(fullText: string, fileName: string): DetectedMeta {
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fileTitle = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();

  const titleLine = lines.slice(0, 20).find(
    (l) => l.length >= 4 && l.length <= 90 && l.split(/\s+/).length <= 14 && !/^\d+$/.test(l),
  );

  const authorLine = lines.slice(0, 40).find((l) => /^(by|author|written by|compiled by|translated by)\s+/i.test(l));
  const author = authorLine
    ? authorLine.replace(/^(by|author|written by|compiled by|translated by)\s*/i, '').trim()
    : '';

  const descLine = lines.slice(0, 50).find(
    (l) => l.length > 30 && l.length < 250 && l.split(/\s+/).length > 5 && l !== titleLine,
  );

  const hijriRange = /(\d{3,4})\s*[–\-]\s*(\d{3,4})\s*AH/i.exec(fullText.slice(0, 3000));
  const hijriSingle = /\b(\d{3,4})\s*AH\b/i.exec(fullText.slice(0, 3000));

  return {
    title: (titleLine || fileTitle).trim(),
    author,
    description: descLine || '',
    hijriStart: hijriRange ? +hijriRange[1] : hijriSingle ? +hijriSingle[1] : undefined,
    hijriEnd: hijriRange ? +hijriRange[2] : undefined,
  };
}
