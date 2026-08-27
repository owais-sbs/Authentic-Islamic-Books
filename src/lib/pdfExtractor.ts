/**
 * pdfExtractor.ts
 * Browser-side PDF text extraction using pdfjs-dist.
 * Returns raw pages of text, then we run structure detection on top.
 */

import type { ContentBlock, BookChapter, BookSection } from '@/types';

// ─── PDF.js lazy import ───────────────────────────────────────────────────────
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  // Use the bundled worker that ships with pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  return pdfjsLib;
}

// ─── Raw extraction ───────────────────────────────────────────────────────────

export interface RawPage {
  pageNum: number;
  text: string;
}

export async function extractPagesFromFile(file: File): Promise<RawPage[]> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: RawPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    pages.push({ pageNum: i, text });
  }
  return pages;
}

// ─── Structure detection ──────────────────────────────────────────────────────

export interface DetectedMeta {
  title: string;
  author: string;
  description: string;
  hijriStart?: number;
  hijriEnd?: number;
}

export interface DetectedChapter {
  number: string;
  title: string;
  description: string;
  rawText: string;
  sections: DetectedSection[];
}

export interface DetectedSection {
  number: string;
  title: string;
  rawText: string;
}

export interface ParsedBook {
  meta: DetectedMeta;
  introductionText: string;
  chapters: DetectedChapter[];
  pageCount: number;
  wordCount: number;
}

// Patterns to detect chapter headings
const CHAPTER_PATTERNS = [
  /^chapter\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.*)$/i,
  /^(\d+)\s*\.\s+([A-Z][^.]{3,60})$/,
  /^Part\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.*)$/i,
  /^Section\s+(\d+)\s*[:\-–—]\s*(.*)$/i,
];

// Patterns for section headings (numbered sub-sections)
const SECTION_PATTERNS = [
  /^(\d+\.\d+)\s+([A-Z][^.]{2,60})$/,
  /^(\d+\.\d+)\s*[:\-–—]\s*(.{3,60})$/,
];

// Hijri year patterns like "701 AH" or "701–774 AH"
const HIJRI_PATTERN = /(\d{3,4})\s*[–\-]\s*(\d{3,4})\s*AH/i;
const HIJRI_SINGLE  = /\b(\d{3,4})\s*AH\b/i;

function detectHijriYears(text: string): { start?: number; end?: number } {
  const range = HIJRI_PATTERN.exec(text);
  if (range) return { start: Number(range[1]), end: Number(range[2]) };
  const single = HIJRI_SINGLE.exec(text);
  if (single) return { start: Number(single[1]) };
  return {};
}

function detectMeta(fullText: string, fileName: string): DetectedMeta {
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Clean filename for fallback title
  const fileTitle = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Title candidates: first 15 lines, 4-80 chars, not pure numbers, not all-lowercase
  const titleCandidates = lines.slice(0, 15).filter(
    (l) =>
      l.length >= 4 &&
      l.length <= 80 &&
      !/^\d+$/.test(l) &&            // not just numbers
      !/^[a-z]/.test(l) &&           // starts with capital or Arabic
      !CHAPTER_PATTERNS.some((p) => p.test(l)) // not a chapter heading
  );

  // Pick the shortest plausible title (titles are usually short — not a whole paragraph)
  const detectedTitle = titleCandidates
    .filter((l) => l.split(' ').length <= 12) // max 12 words
    .sort((a, b) => a.length - b.length)[0];  // shortest wins

  const title = detectedTitle || fileTitle;

  // Author: line containing "By", "Author:", "Written by"
  const authorLine = lines.slice(0, 30).find((l) =>
    /^(by|author|written by|compiled by)\s+/i.test(l)
  );
  const author = authorLine
    ? authorLine.replace(/^(by|author|written by|compiled by)\s*/i, '').trim()
    : '';

  // Description: first line that looks like a sentence (30-250 chars)
  const descLine = lines.slice(0, 40).find(
    (l) =>
      l.length > 30 &&
      l.length < 250 &&
      l.split(' ').length > 5 &&
      !CHAPTER_PATTERNS.some((p) => p.test(l)) &&
      l !== title
  );
  const description = descLine || '';

  const hijri = detectHijriYears(fullText.slice(0, 2000));

  return {
    title: title.trim(),
    author,
    description,
    hijriStart: hijri.start,
    hijriEnd: hijri.end,
  };
}

function splitIntoChapters(fullText: string): DetectedChapter[] {
  const lines = fullText.split('\n');
  const chapters: DetectedChapter[] = [];
  let currentChapter: DetectedChapter | null = null;
  let chapterCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let matched = false;
    for (const pattern of CHAPTER_PATTERNS) {
      const m = pattern.exec(line);
      if (m) {
        if (currentChapter) chapters.push(currentChapter);
        chapterCounter++;
        currentChapter = {
          number: String(chapterCounter),
          title: (m[2] || m[1] || `Chapter ${chapterCounter}`).trim(),
          description: '',
          rawText: '',
          sections: [],
        };
        matched = true;
        break;
      }
    }

    if (!matched && currentChapter) {
      currentChapter.rawText += line + '\n';
    } else if (!matched && !currentChapter && chapterCounter === 0) {
      // Text before first chapter → treat as possible intro content
    }
  }

  if (currentChapter) chapters.push(currentChapter);

  // If no chapters detected, treat whole text as one chapter
  if (chapters.length === 0 && fullText.trim()) {
    const words = fullText.trim().split(/\s+/);
    const chunkSize = Math.ceil(words.length / 3);
    for (let c = 0; c < 3; c++) {
      const chunk = words.slice(c * chunkSize, (c + 1) * chunkSize).join(' ');
      if (chunk.trim()) {
        chapters.push({
          number: String(c + 1),
          title: c === 0 ? 'Introduction' : `Chapter ${c + 1}`,
          description: '',
          rawText: chunk,
          sections: [],
        });
      }
    }
  }

  // Split each chapter into sections
  for (const chapter of chapters) {
    chapter.sections = splitIntoSections(chapter.rawText, chapter.number);
  }

  return chapters;
}

function splitIntoSections(chapterText: string, chapterNum: string): DetectedSection[] {
  const lines = chapterText.split('\n');
  const sections: DetectedSection[] = [];
  let current: DetectedSection | null = null;
  let secCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let matched = false;
    for (const pattern of SECTION_PATTERNS) {
      const m = pattern.exec(line);
      if (m) {
        if (current) sections.push(current);
        secCounter++;
        current = {
          number: m[1] || `${chapterNum}.${secCounter}`,
          title: (m[2] || `Section ${secCounter}`).trim(),
          rawText: '',
        };
        matched = true;
        break;
      }
    }

    if (!matched && current) {
      current.rawText += line + ' ';
    }
  }

  if (current) sections.push(current);

  // If no sections detected, split chapter text into reasonable chunks (~300 words each)
  if (sections.length === 0 && chapterText.trim()) {
    const words = chapterText.trim().split(/\s+/);
    const chunkSize = 300;
    let secIdx = 1;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        sections.push({
          number: `${chapterNum}.${secIdx}`,
          title: `Section ${chapterNum}.${secIdx}`,
          rawText: chunk,
        });
        secIdx++;
      }
    }
  }

  return sections;
}

export async function parsePdf(file: File): Promise<ParsedBook> {
  const pages = await extractPagesFromFile(file);
  const fullText = pages.map((p) => p.text).join('\n');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const meta = detectMeta(fullText, file.name);

  // Introduction: text before first chapter heading (~first 500 words)
  const introWords = fullText.split(/\s+/).slice(0, 500).join(' ');

  const chapters = splitIntoChapters(fullText);

  return {
    meta,
    introductionText: introWords,
    chapters,
    pageCount: pages.length,
    wordCount,
  };
}

// ─── Conversion to public Book format ─────────────────────────────────────────

export function rawTextToContentBlocks(text: string): ContentBlock[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 20);

  const blocks: ContentBlock[] = [];
  let current = '';

  for (const sentence of sentences) {
    current += (current ? ' ' : '') + sentence;
    if (current.split(' ').length >= 40) {
      blocks.push({ type: 'paragraph', text: current.trim() });
      current = '';
    }
  }
  if (current.trim()) {
    blocks.push({ type: 'paragraph', text: current.trim() });
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', text: text.trim() }];
}

// ─── Safe slug helper ──────────────────────────────────────────────────────────
function safeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)         // max 6 words
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) ||     // max 60 chars
    'imported-book';
}

export function parsedBookToPublicFormat(
  parsed: ParsedBook,
  bookId: string,
  slugHint: string,      // suggested slug from caller — we sanitise it here
  categoryIds: string[],
  authorId: string,
  coverColor: string
): import('@/types').Book {
  // Always re-derive a clean slug from the detected title
  const cleanSlug = safeSlug(parsed.meta.title) || safeSlug(slugHint);
  const intro: ContentBlock[] = rawTextToContentBlocks(parsed.introductionText);

  const chapters: BookChapter[] = parsed.chapters.map((ch, ci) => ({
    id: `${bookId}-ch-${ci + 1}`,
    number: ch.number,
    title: ch.title,
    description: ch.description || undefined,
    sections: ch.sections.map((sec, si): BookSection => ({
      id: `${bookId}-ch-${ci + 1}-sec-${si + 1}`,
      number: sec.number,
      title: sec.title,
      content: rawTextToContentBlocks(sec.rawText),
    })),
  }));

  return {
    id: bookId,
    slug: cleanSlug,
    title: parsed.meta.title,
    subtitle: undefined,
    authorId,
    description: parsed.meta.description || `${parsed.meta.title} — an Islamic scholarly work.`,
    longDescription: undefined,
    coverColor,
    hijriStart: parsed.meta.hijriStart ?? 700,
    hijriEnd: parsed.meta.hijriEnd ?? 800,
    categoryIds,
    chapters,
    introduction: intro,
    featured: false,
    publishedYear: parsed.meta.hijriStart ? `circa ${parsed.meta.hijriStart} AH` : undefined,
    popularity: 50,
    addedDate: new Date().toISOString().slice(0, 10),
  };
}
