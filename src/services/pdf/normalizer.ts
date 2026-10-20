import type { RawPage } from '@/lib/pdfExtractor';
import type { NormalizedBlock, NormalizedPage } from './types';
import { languageMeta } from './language';
import { pageHasUsableText } from './documentType';
import {
  cleanUnicode,
  isIsolatedStructuralLine,
  isLikelyPageArtifact,
  repairLineWraps,
  stripRepeatedPageArtifacts,
} from '@/services/content/normalizeText';

function collapseSpaces(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

/** Arabic/Urdu-aware cleanup — removes extraction artifacts only, keeps diacritics. */
export function normalizeArabicScript(text: string): string {
  return (
    text
      // Presentation forms → standard where safely mappable via NFKC
      .normalize('NFKC')
      // Tatweel / kashida (decorative elongation)
      .replace(/\u0640+/g, '')
      // Zero-width / BOM leftovers
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
      // Collapse Arabic comma spacing artifacts
      .replace(/\s+([،؛؟!.])/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
  );
}

export function normalizeLatinScript(text: string): string {
  return text
    .normalize('NFC')
    // Typographic ligatures (ﬁ ﬂ ﬀ ﬃ ﬄ ﬅ ﬆ) → plain letters
    .replace(/[\uFB00-\uFB06]/g, (ch) => ch.normalize('NFKC'))
    .replace(/\u00AD/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ');
}

/** Arabic script incl. presentation forms (unshaped glyphs common in PDF text). */
const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function normalizeByScript(text: string): string {
  const cleaned = cleanUnicode(text);
  if (ARABIC_SCRIPT.test(cleaned)) {
    return normalizeArabicScript(cleaned);
  }
  return normalizeLatinScript(cleaned);
}

/** Lookup key so layout heading lines can be matched after normalisation. */
function headingKey(text: string): string {
  return collapseSpaces(normalizeByScript(text)).toLowerCase();
}

const BULLET_LINE = /^[-•*–▪●◦]\s+\S/;
const NUMBERED_LINE = /^(\d{1,3}|[a-zA-Z])[.)]\s+\S/;

const FOOTNOTE_LINE = /^\[[\d*†‡]{1,3}\]\s+\S/;

/**
 * `wholeParagraph`: the line is a paragraph on its own. A numbered line that
 * wraps onto further lines is a list item, never a heading.
 */
function classifyLine(line: string, headingLevel?: 1 | 2, wholeParagraph = true): NormalizedBlock['type'] {
  if (headingLevel) return 'possible-heading';
  // Lists before anything else so dash bullets don't turn into quotes
  if (BULLET_LINE.test(line)) return 'list';
  if (NUMBERED_LINE.test(line) && !/^\d+\.\d/.test(line)) {
    const words = line.split(/\s+/).length;
    const headingLike =
      wholeParagraph && isIsolatedStructuralLine(line) && words <= 10 && !/[.;,:]$/.test(line) && !/,/.test(line);
    return headingLike ? 'possible-heading' : 'list';
  }
  if (isIsolatedStructuralLine(line)) {
    return 'possible-heading';
  }
  // Hadith-collection sub-chapter ("Chapter: What has come regarding …", "Bab: …")
  if (wholeParagraph && line.length <= 120 && /^(chapter|bab|baab)\s*[:\-–—]\s*\S/i.test(line)) {
    return 'possible-heading';
  }
  if (
    line.length <= 80 &&
    line === line.toUpperCase() &&
    /[A-Z]/.test(line) &&
    line.split(/\s+/).length >= 2
  ) {
    return 'possible-heading';
  }
  // Short Arabic/Urdu structural lines
  if (
    line.length <= 90 &&
    /^(الكتاب|الباب|الفصل|المبحث|المطلب|مقدمة|تمهيد|باب|فصل|کتاب|مقدمہ|تمہید)/.test(line)
  ) {
    return 'possible-heading';
  }
  return 'text';
}

/** A whole paragraph wrapped in quotation marks (optionally followed by a short citation). */
function isQuotedParagraph(text: string): boolean {
  return /^["“«][^]{10,}["”»](\s*[([—–-][^]{0,80})?$/.test(text);
}

function textBlock(text: string): NormalizedBlock {
  const meta = languageMeta(text);
  return {
    text: collapseSpaces(text),
    type: 'text',
    confidence: 'high',
    language: meta.language,
    direction: meta.direction,
  };
}

/**
 * Split page text into natural paragraph blocks. Paragraph breaks (blank lines)
 * come from the PDF layout; text is never merged across them and never
 * chunked by word count.
 */
function splitIntoParagraphBlocks(
  pageText: string,
  headingLevels: Map<string, 1 | 2> = new Map(),
): NormalizedBlock[] {
  const normalized = repairLineWraps(normalizeByScript(pageText));
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: NormalizedBlock[] = [];

  for (const para of paragraphs) {
    const lines = para
      .split('\n')
      .map((l) => collapseSpaces(l))
      .filter((l) => l && !isLikelyPageArtifact(l));
    if (lines.length === 0) continue;

    const joined = lines.join(' ');
    if (lines.length > 1 && isQuotedParagraph(joined)) {
      const meta = languageMeta(joined);
      blocks.push({ text: joined, type: 'quote', confidence: 'medium', language: meta.language, direction: meta.direction });
      continue;
    }

    // Footnote text from the bottom of the page ("[1] Ibn Majah, no. 224.")
    if (FOOTNOTE_LINE.test(lines[0])) {
      const meta = languageMeta(joined);
      blocks.push({ text: joined, type: 'text', footnote: true, confidence: 'high', language: meta.language, direction: meta.direction });
      continue;
    }

    // Lines of one paragraph: plain text lines are joined; headings/list items
    // split it. A change of script (e.g. an Arabic line in English text) also splits.
    let buf = '';
    let listOpen = false;
    let bufLang: NormalizedBlock['language'];
    const flush = () => {
      if (buf.trim()) blocks.push(textBlock(buf));
      buf = '';
      bufLang = undefined;
    };

    for (const line of lines) {
      const level = headingLevels.get(headingKey(line));
      const type = classifyLine(line, level, lines.length === 1);
      const meta = languageMeta(line);

      if (type === 'possible-heading' && line.split(/\s+/).length <= 16) {
        flush();
        blocks.push({
          text: line,
          type: 'possible-heading',
          confidence:
            level || line === line.toUpperCase() || isIsolatedStructuralLine(line) ? 'medium' : 'low',
          headingLevel: level,
          language: meta.language,
          direction: meta.direction,
        });
        continue;
      }

      if (type === 'list') {
        flush();
        blocks.push({ text: line, type: 'list', confidence: 'high', language: meta.language, direction: meta.direction });
        listOpen = true;
        continue;
      }

      if (lines.length === 1 && isQuotedParagraph(line)) {
        blocks.push({ text: line, type: 'quote', confidence: 'medium', language: meta.language, direction: meta.direction });
        continue;
      }

      if (buf && bufLang && meta.language && meta.language !== bufLang && meta.language !== 'unknown') {
        flush();
      }
      // A list item that wraps onto the next line(s) of its paragraph continues the item
      const lastBlock = blocks[blocks.length - 1];
      if (!buf && lastBlock?.type === 'list' && (listOpen || /^[a-z(]/.test(line))) {
        lastBlock.text = `${lastBlock.text} ${line}`;
        continue;
      }
      buf += (buf ? ' ' : '') + line;
      bufLang = meta.language ?? bufLang;
    }
    flush();
  }

  return blocks;
}

const PAGE_END_SENTENCE = /[.!?؟:…»"”)\]]$/;

/**
 * Join a paragraph that runs across a page break: the previous page ends
 * mid-sentence and the next page continues it.
 */
function joinAcrossPages(pages: NormalizedPage[]): NormalizedPage[] {
  let prevPage: NormalizedPage | null = null;
  for (const page of pages) {
    if (page.blocks.length === 0) continue;
    if (prevPage) {
      // Footnotes sit between the two halves of a paragraph that crosses the page
      const last = [...prevPage.blocks].reverse().find((b) => !b.footnote);
      const first = page.blocks[0];
      const continues =
        last?.type === 'text' &&
        first?.type === 'text' &&
        !PAGE_END_SENTENCE.test(last.text) &&
        (/^[\p{Ll}(]/u.test(first.text) ||
          (/[\p{L},;-]$/u.test(last.text) && last.language === first.language));
      if (continues) {
        const hyphenated = /\p{L}-$/u.test(last.text) && /^\p{Ll}/u.test(first.text);
        last.text = hyphenated ? `${last.text.slice(0, -1)}${first.text}` : `${last.text} ${first.text}`;
        page.blocks = page.blocks.slice(1);
      }
    }
    if (page.blocks.length > 0) prevPage = page;
  }
  return pages;
}

export interface TocEntry {
  title: string;
  level: 1 | 2;
}

/** "Chapter 1: The Pillars of Faith . . . . 4"  /  "Introduction ........ 3" */
const TOC_LEADER_LINE = /^(.{2,140}?)\s*(?:(?:\.\s?){3,}|…+|_{3,}|-{3,})\s*(\d{1,4}|[ivxlc]{1,6})\s*$/i;
const TOC_NUMBER_LINE = /^(.{2,120}?)\s+(\d{1,4})\s*$/;

/**
 * Find the book's contents page(s) and read the chapter / section titles.
 * Those pages are dropped from the body and the titles guide chapter detection.
 */
export function extractTableOfContents(pages: RawPage[]): { entries: TocEntry[]; tocPages: Set<number> } {
  const entries: TocEntry[] = [];
  const tocPages = new Set<number>();
  const limit = Math.min(pages.length, 30);

  for (let i = 0; i < limit; i++) {
    const lines = pages[i].text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;
    const leader = lines.filter((l) => TOC_LEADER_LINE.test(l));
    const numbered = lines.filter((l) => TOC_NUMBER_LINE.test(l) && l.length <= 90);
    const isToc =
      (leader.length >= 3 && leader.length >= lines.length * 0.4) ||
      (numbered.length >= 5 && numbered.length >= lines.length * 0.7);
    if (!isToc) {
      if (tocPages.size > 0) break; // contents finished
      continue;
    }
    tocPages.add(pages[i].pageNum);
    for (const line of lines) {
      const m = TOC_LEADER_LINE.exec(line) || TOC_NUMBER_LINE.exec(line);
      if (!m) continue;
      const title = m[1].replace(/[\s.…_-]+$/, '').trim();
      if (!title || /^(contents|table of contents|الفهرس|فهرست)$/i.test(title)) continue;
      entries.push({ title, level: /^\d+\.\d+/.test(title) ? 2 : 1 });
    }
  }
  return { entries, tocPages };
}

/**
 * Rank heading font sizes across the whole book: the largest size used for
 * at least two headings is the chapter size; anything smaller is a sub-heading.
 */
function headingTiers(pages: RawPage[]): (size: number) => 1 | 2 {
  const counts = new Map<number, number>();
  pages.forEach((p, idx) => {
    if (idx === 0 || p.fromOcr) return; // title page; OCR line heights are only estimates
    for (const h of p.headingLines ?? []) {
      const size = Math.round(h.size ?? 0);
      if (size) counts.set(size, (counts.get(size) ?? 0) + 1);
    }
  });
  const repeated = [...counts.entries()].filter(([, c]) => c >= 2).map(([s]) => s);
  const chapterSize = repeated.length ? Math.max(...repeated) : Math.max(0, ...counts.keys());
  return (size: number) => (size >= chapterSize * 0.88 ? 1 : 2);
}

/** Clean raw PDF.js page text into structured blocks without changing meaning. */
export function normalizePages(pages: RawPage[]): NormalizedPage[] {
  const { tocPages } = extractTableOfContents(pages);
  const stripped = stripRepeatedPageArtifacts(pages.map((p) => p.text));
  const seenPageHashes = new Set<string>();
  const tierOf = headingTiers(pages);

  const normalized = pages.map((page, idx) => {
    if (tocPages.has(page.pageNum)) {
      return { pageNumber: page.pageNum, blocks: [], requiresOcr: false };
    }
    const pageText = stripped[idx] ?? page.text;
    const requiresOcr = !pageHasUsableText(pageText);
    // Only skip exact full-page duplicates (running headers), never drop unique short pages
    const exactKey = pageText.replace(/\s+/g, ' ').trim();
    if (
      exactKey.length > 0 &&
      exactKey.length < 180 &&
      seenPageHashes.has(exactKey) &&
      !requiresOcr
    ) {
      return {
        pageNumber: page.pageNum,
        blocks: [],
        requiresOcr,
      };
    }
    if (exactKey) seenPageHashes.add(exactKey);
    const headingLevels = new Map<string, 1 | 2>();
    for (const h of page.headingLines ?? []) {
      headingLevels.set(headingKey(h.text), h.size ? tierOf(h.size) : h.level);
    }
    return {
      pageNumber: page.pageNum,
      // Short pages (a lone chapter title, a closing line) still keep their text
      blocks: pageText.trim() ? splitIntoParagraphBlocks(pageText, headingLevels) : [],
      requiresOcr,
    };
  });

  return joinAcrossPages(normalized);
}

export function normalizedPagesToPlainText(pages: NormalizedPage[]): string {
  return pages
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .flatMap((p) => p.blocks.map((b) => b.text.trim()).filter(Boolean))
    .join('\n\n');
}
