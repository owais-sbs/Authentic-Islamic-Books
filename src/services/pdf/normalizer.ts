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
    .replace(/\u00AD/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ');
}

function normalizeByScript(text: string): string {
  const cleaned = cleanUnicode(text);
  if (/[\u0600-\u06FF]/.test(cleaned)) {
    return normalizeArabicScript(cleaned);
  }
  return normalizeLatinScript(cleaned);
}

function classifyLine(line: string): NormalizedBlock['type'] {
  if (isIsolatedStructuralLine(line)) {
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
  if (/^["“«].{10,}/.test(line) || /^[-–—]\s+/.test(line)) {
    return 'quote';
  }
  if (/^(\d+[.)]|\u2022|\*|-)\s+\S/.test(line)) {
    return 'list';
  }
  return 'text';
}

/**
 * Split page text into natural paragraph blocks.
 * Does NOT artificially chunk by word count (no ~45-word splits).
 */
function splitIntoParagraphBlocks(pageText: string): NormalizedBlock[] {
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
      .filter(Boolean);

    // Single multi-line paragraph that is not heading-like → one text block
    const onlyText =
      lines.length > 1 &&
      lines.every((l) => classifyLine(l) === 'text' && !isIsolatedStructuralLine(l));

    if (onlyText) {
      const text = lines.join(' ');
      const meta = languageMeta(text);
      blocks.push({
        text: collapseSpaces(text),
        type: 'text',
        confidence: 'high',
        language: meta.language,
        direction: meta.direction,
      });
      continue;
    }

    for (const line of lines) {
      if (isLikelyPageArtifact(line)) continue;

      const headingType = classifyLine(line);
      const meta = languageMeta(line);

      if (headingType === 'possible-heading' && line.split(/\s+/).length <= 16) {
        blocks.push({
          text: line,
          type: 'possible-heading',
          confidence:
            line === line.toUpperCase() || isIsolatedStructuralLine(line) ? 'medium' : 'low',
          language: meta.language,
          direction: meta.direction,
        });
        continue;
      }

      if (headingType === 'quote') {
        blocks.push({
          text: line.replace(/^[-–—]\s+/, ''),
          type: 'quote',
          confidence: 'medium',
          language: meta.language,
          direction: meta.direction,
        });
        continue;
      }

      if (headingType === 'list') {
        blocks.push({
          text: line,
          type: 'list',
          confidence: 'high',
          language: meta.language,
          direction: meta.direction,
        });
        continue;
      }

      blocks.push({
        text: line,
        type: 'text',
        confidence: 'high',
        language: meta.language,
        direction: meta.direction,
      });
    }
  }

  // Merge consecutive text blocks that share language into natural paragraphs
  const merged: NormalizedBlock[] = [];
  let buf = '';
  let bufLang = merged[0]?.language;

  const flush = () => {
    if (!buf.trim()) return;
    const meta = languageMeta(buf);
    merged.push({
      text: collapseSpaces(buf),
      type: 'text',
      confidence: 'high',
      language: meta.language,
      direction: meta.direction,
    });
    buf = '';
    bufLang = undefined;
  };

  for (const b of blocks) {
    if (b.type === 'text') {
      // Keep language changes as separate blocks (e.g. Arabic quote amid English)
      if (buf && bufLang && b.language && b.language !== bufLang && b.language !== 'unknown') {
        flush();
      }
      buf += (buf ? ' ' : '') + b.text;
      bufLang = b.language ?? bufLang;
      // Soft safety for extremely long runs only — not scholarly paragraph splitting
      if (buf.length > 8000) flush();
    } else {
      flush();
      merged.push(b);
    }
  }
  flush();
  return merged;
}

/** Clean raw PDF.js page text into structured blocks without changing meaning. */
export function normalizePages(pages: RawPage[]): NormalizedPage[] {
  const stripped = stripRepeatedPageArtifacts(pages.map((p) => p.text));
  const seenPageHashes = new Set<string>();

  return pages.map((page, idx) => {
    const pageText = stripped[idx] ?? page.text;
    const requiresOcr = !pageHasUsableText(pageText);
    const hash = pageText.slice(0, 120);
    if (seenPageHashes.has(hash) && pageText.length < 400 && !requiresOcr) {
      return {
        pageNumber: page.pageNum,
        blocks: [],
        requiresOcr,
      };
    }
    seenPageHashes.add(hash);
    return {
      pageNumber: page.pageNum,
      blocks: requiresOcr ? [] : splitIntoParagraphBlocks(pageText),
      requiresOcr,
    };
  });
}

export function normalizedPagesToPlainText(pages: NormalizedPage[]): string {
  return pages
    .flatMap((p) => p.blocks.map((b) => b.text))
    .filter(Boolean)
    .join('\n');
}
