/**
 * pdfExtractor.ts
 * Browser-side PDF text extraction using pdfjs-dist.
 *
 * Chapter detection strategy (in order of priority):
 *  1. Explicit heading patterns  ("Chapter 1", "Part II", etc.)
 *  2. Short ALL-CAPS lines that look like section titles
 *  3. Numbered-heading lines     ("1. Title", "2. Title")
 *  4. Adaptive page-based split  — one chapter per N pages so every page
 *     of content ends up in a chapter regardless of PDF formatting
 *
 * The old hardcoded "3 chunks" fallback is replaced by option 4, which
 * scales with the actual document length.
 */

import type { ContentBlock, BookChapter, BookSection } from '@/types';
import { runPipeline } from '@/services/pdf/pipeline';
import { textToContentBlocks } from '@/services/pdf/toContentBlocks';
import type { PipelineProgressCallback } from '@/services/pdf/types';

// ─── PDF.js lazy import ───────────────────────────────────────────────────────
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  return pdfjsLib;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawPage {
  pageNum: number;
  text: string;
}

export interface DetectedMeta {
  title: string;
  author: string;
  description: string;
  hijriStart?: number;
  hijriEnd?: number;
}

export interface DetectedSection {
  number: string;
  title: string;
  rawText: string;
}

export interface DetectedChapter {
  number: string;
  title: string;
  description: string;
  rawText: string;
  sections: DetectedSection[];
}

export interface ParsedBook {
  meta: DetectedMeta;
  introductionText: string;
  chapters: DetectedChapter[];
  pageCount: number;
  wordCount: number;
}

// ─── Heading patterns ─────────────────────────────────────────────────────────

/** Explicit chapter/part keywords */
const EXPLICIT_CHAPTER = [
  /^chapter\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,80})$/i,
  /^part\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,80})$/i,
  /^lesson\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,80})$/i,
  /^unit\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,80})$/i,
  /^book\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.{0,80})$/i,
];

/** Lines like "1. The Foundations" or "IV. Introduction" */
const NUMBERED_HEADING = /^(\d{1,3}|[IVX]{1,6})[.)]\s+([A-Z\u0600-\u06FF][^\n]{2,70})$/;

/** Numbered sub-sections like "1.1 Background" */
const SECTION_PATTERNS = [
  /^(\d+\.\d+)\s+([A-Z\u0600-\u06FF][^\n]{2,70})$/,
  /^(\d+\.\d+)\s*[:\-–—]\s*(.{3,70})$/,
];

// Hijri year patterns
const HIJRI_RANGE  = /(\d{3,4})\s*[–\-]\s*(\d{3,4})\s*AH/i;
const HIJRI_SINGLE = /\b(\d{3,4})\s*AH\b/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectHijriYears(text: string): { start?: number; end?: number } {
  const r = HIJRI_RANGE.exec(text);
  if (r) return { start: +r[1], end: +r[2] };
  const s = HIJRI_SINGLE.exec(text);
  if (s) return { start: +s[1] };
  return {};
}

function isExplicitChapterLine(line: string): { num: string; title: string } | null {
  for (const pat of EXPLICIT_CHAPTER) {
    const m = pat.exec(line);
    if (m) return { num: m[1] || '', title: (m[2] || '').trim() };
  }
  return null;
}

function isNumberedHeadingLine(line: string): { num: string; title: string } | null {
  const m = NUMBERED_HEADING.exec(line);
  if (m) return { num: m[1], title: m[2].trim() };
  return null;
}

/** True if a short line looks like an ALL-CAPS section title (≥3 words, ≤10 words) */
function isAllCapsHeading(line: string): boolean {
  const words = line.split(/\s+/);
  return (
    words.length >= 2 &&
    words.length <= 10 &&
    line === line.toUpperCase() &&
    /^[A-Z]/.test(line) &&
    !/^\d+$/.test(line)
  );
}

// ─── Metadata detection ───────────────────────────────────────────────────────

function detectMeta(fullText: string, fileName: string): DetectedMeta {
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);

  const fileTitle = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  // Title: look in the first 20 lines for a short, capitalised line
  const titleLine = lines.slice(0, 20).find(
    (l) =>
      l.length >= 4 &&
      l.length <= 90 &&
      l.split(/\s+/).length <= 14 &&
      !/^\d+$/.test(l) &&
      !isExplicitChapterLine(l) &&
      !NUMBERED_HEADING.test(l)
  );
  const title = titleLine || fileTitle;

  // Author: line starting with a known label
  const authorLine = lines.slice(0, 40).find((l) =>
    /^(by|author|written by|compiled by|translated by)\s+/i.test(l)
  );
  const author = authorLine
    ? authorLine.replace(/^(by|author|written by|compiled by|translated by)\s*/i, '').trim()
    : '';

  // Description: first sentence-like line (30-250 chars, >5 words)
  const descLine = lines.slice(0, 50).find(
    (l) =>
      l.length > 30 &&
      l.length < 250 &&
      l.split(/\s+/).length > 5 &&
      !isExplicitChapterLine(l) &&
      l !== title
  );

  const hijri = detectHijriYears(fullText.slice(0, 3000));

  return {
    title: title.trim(),
    author,
    description: descLine || '',
    hijriStart: hijri.start,
    hijriEnd: hijri.end,
  };
}

// ─── Chapter splitting ────────────────────────────────────────────────────────

function splitIntoChapters(pages: RawPage[]): DetectedChapter[] {
  const fullText = pages.map((p) => p.text).join('\n');
  const lines = fullText.split('\n');

  const chapters: DetectedChapter[] = [];
  const state = { current: null as DetectedChapter | null };
  let chapterCounter = 0;

  function pushNew(num: string, title: string) {
    if (state.current) chapters.push(state.current);
    chapterCounter++;
    state.current = {
      number: num || String(chapterCounter),
      title: title || `Chapter ${chapterCounter}`,
      description: '',
      rawText: '',
      sections: [],
    };
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const exp = isExplicitChapterLine(line);
    if (exp) { pushNew(exp.num, exp.title); continue; }

    const num = isNumberedHeadingLine(line);
    if (num) { pushNew(num.num, num.title); continue; }

    if (isAllCapsHeading(line)) { pushNew('', line); continue; }

    if (state.current) state.current.rawText += line + '\n';
  }
  if (state.current) chapters.push(state.current);

  // ── Fallback: no headings detected ──────────────────────────────────────────
  // Split by pages so the number of chapters scales with the document.
  if (chapters.length === 0) {
    const PAGES_PER_CHAPTER = 5; // ~5 pages per chapter is a reasonable default
    const totalPages = pages.length;
    const numChapters = Math.max(1, Math.ceil(totalPages / PAGES_PER_CHAPTER));

    for (let ci = 0; ci < numChapters; ci++) {
      const startPage = ci * PAGES_PER_CHAPTER;
      const endPage   = Math.min(startPage + PAGES_PER_CHAPTER, totalPages);
      const chunkText = pages
        .slice(startPage, endPage)
        .map((p) => p.text)
        .join('\n');

      if (chunkText.trim()) {
        chapters.push({
          number: String(ci + 1),
          title: `Chapter ${ci + 1}`,
          description: '',
          rawText: chunkText,
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

// ─── Section splitting ────────────────────────────────────────────────────────

function splitIntoSections(chapterText: string, chapterNum: string): DetectedSection[] {
  if (!chapterText.trim()) return [];

  const lines = chapterText.split('\n');
  const sections: DetectedSection[] = [];
  let current: DetectedSection | null = null;
  let secCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let matched = false;
    for (const pat of SECTION_PATTERNS) {
      const m = pat.exec(line);
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

  // Fallback: no numbered sections → split by word count
  // Scale section size to chapter size so large chapters get more sections
  if (sections.length === 0 && chapterText.trim()) {
    const words = chapterText.trim().split(/\s+/);
    const totalWords = words.length;

    // Target ~400 words per section, but at least 1 and at most 20 per chapter
    const WORDS_PER_SECTION = 400;
    const numSections = Math.min(20, Math.max(1, Math.round(totalWords / WORDS_PER_SECTION)));
    const chunkSize = Math.ceil(totalWords / numSections);

    for (let i = 0; i < numSections; i++) {
      const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
      if (chunk.trim()) {
        const secNum = `${chapterNum}.${i + 1}`;
        sections.push({
          number: secNum,
          title: `Section ${secNum}`,
          rawText: chunk,
        });
      }
    }
  }

  return sections;
}

// ─── Main parse function ──────────────────────────────────────────────────────

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

export async function parsePdf(
  file: File,
  onProgress?: PipelineProgressCallback,
): Promise<ParsedBook> {
  onProgress?.('read', 'Reading PDF document…');
  const pages = await extractPagesFromFile(file);
  onProgress?.('extract', 'Extracting text content…');
  return runPipeline(pages, file.name, onProgress);
}

// ─── Conversion to public Book format ─────────────────────────────────────────

export function rawTextToContentBlocks(text: string): ContentBlock[] {
  return textToContentBlocks(text);
}

// ─── Safe slug ────────────────────────────────────────────────────────────────

function safeSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'imported-book'
  );
}

// ─── Build public Book object ──────────────────────────────────────────────────

export function parsedBookToPublicFormat(
  parsed: ParsedBook,
  bookId: string,
  slugHint: string,
  categoryIds: string[],
  authorId: string,
  coverColor: string
): import('@/types').Book {
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
    description:
      parsed.meta.description ||
      `${parsed.meta.title} — an Islamic scholarly work.`,
    longDescription: undefined,
    coverColor,
    hijriStart: parsed.meta.hijriStart ?? 700,
    hijriEnd:   parsed.meta.hijriEnd   ?? 800,
    categoryIds,
    chapters,
    introduction: intro,
    featured: false,
    publishedYear: parsed.meta.hijriStart
      ? `circa ${parsed.meta.hijriStart} AH`
      : undefined,
    popularity: 50,
    addedDate: new Date().toISOString().slice(0, 10),
  };
}
