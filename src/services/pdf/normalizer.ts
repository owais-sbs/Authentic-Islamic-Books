import type { RawPage } from '@/lib/pdfExtractor';
import type { NormalizedBlock, NormalizedPage } from './types';

const PAGE_NUMBER = /^\s*\d{1,4}\s*$/;
const FOOTER_PATTERNS = [
  /^\s*page\s+\d+\s*(of\s+\d+)?\s*$/i,
  /^\s*-\s*\d+\s*-\s*$/,
  /^\s*©\s*/,
];

function cleanUnicode(text: string): string {
  return text
    .replace(/\u00AD/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');
}

function joinHyphenatedLines(text: string): string {
  return text.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');
}

function collapseSpaces(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

function isLikelyFooter(line: string): boolean {
  return FOOTER_PATTERNS.some((p) => p.test(line)) || PAGE_NUMBER.test(line);
}

function classifyLine(line: string): NormalizedBlock['type'] {
  if (line.length <= 80 && line === line.toUpperCase() && /[A-Z]/.test(line) && line.split(/\s+/).length >= 2) {
    return 'possible-heading';
  }
  if (/^["“«].{10,}/.test(line) || /^[-–—]\s+/.test(line)) {
    return 'quote';
  }
  if (/^(\d+[.)]|\u2022|\*|-)\s+\S/.test(line)) {
    return 'list';
  }
  return 'text';
}

function splitIntoParagraphBlocks(pageText: string): NormalizedBlock[] {
  const normalized = joinHyphenatedLines(cleanUnicode(pageText));
  const rawLines = normalized.split(/\n+/).map((l) => collapseSpaces(l)).filter(Boolean);

  const blocks: NormalizedBlock[] = [];
  let paragraph = '';

  const flushParagraph = () => {
    const text = collapseSpaces(paragraph);
    if (!text) return;
    blocks.push({ text, type: 'text' });
    paragraph = '';
  };

  for (const line of rawLines) {
    if (isLikelyFooter(line)) continue;

    const headingType = classifyLine(line);
    if (headingType === 'possible-heading' && line.split(/\s+/).length <= 12) {
      flushParagraph();
      blocks.push({
        text: collapseSpaces(line.replace(/\s{2,}/g, ' ')),
        type: 'possible-heading',
        confidence: line === line.toUpperCase() ? 'medium' : 'low',
      });
      continue;
    }

    if (headingType === 'quote') {
      flushParagraph();
      blocks.push({ text: line.replace(/^[-–—]\s+/, ''), type: 'quote', confidence: 'medium' });
      continue;
    }

    if (headingType === 'list') {
      flushParagraph();
      blocks.push({ text: line, type: 'list', confidence: 'high' });
      continue;
    }

    paragraph += (paragraph ? ' ' : '') + line;
    if (paragraph.length > 900) flushParagraph();
  }

  flushParagraph();
  return blocks;
}

/** Clean raw PDF.js page text into structured blocks without changing meaning. */
export function normalizePages(pages: RawPage[]): NormalizedPage[] {
  const seenPageHashes = new Set<string>();

  return pages
    .map((page) => {
      const hash = page.text.slice(0, 120);
      if (seenPageHashes.has(hash) && page.text.length < 400) return null;
      seenPageHashes.add(hash);
      return {
        pageNumber: page.pageNum,
        blocks: splitIntoParagraphBlocks(page.text),
      };
    })
    .filter((p): p is NormalizedPage => Boolean(p && p.blocks.length > 0));
}

export function normalizedPagesToPlainText(pages: NormalizedPage[]): string {
  return pages.flatMap((p) => p.blocks.map((b) => b.text)).join('\n');
}
