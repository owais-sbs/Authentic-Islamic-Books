/**
 * Controlled Markdown intermediate representation for PDF imports.
 * Deterministic serialize/parse — not a general Markdown engine.
 *
 * Designed for large multi-chapter / multi-hundred-page books:
 * - Chapter/section numbers are always decimal digits (10, 11, 100…)
 *   so double- and triple-digit chapters round-trip correctly.
 * - Em-dash separators keep numbers unambiguous vs title text.
 * - Full chapter/section body text is preserved without truncation.
 * - Page count is stored in metadata (`> PAGES:`) for admin review.
 */

import type { DetectedChapter, DetectedMeta, DetectedSection } from '@/lib/pdfExtractor';
import type { BookLanguage } from './language';
import type { DocumentType } from './documentType';

export interface MarkdownBookDraft {
  meta: DetectedMeta;
  languages: BookLanguage[];
  documentType?: DocumentType;
  pageCount?: number;
  introductionText: string;
  chapters: DetectedChapter[];
}

/** Digits-only chapter/section number (supports 1…n with no upper digit cap). */
const NUM = String.raw`(\d+(?:\.\d+)*)`;

function escapeOneLine(s: string): string {
  return s.replace(/\r?\n/g, ' ').trim();
}

/** Normalize chapter/section number to clean decimal digits (no leading zeros). */
function normalizeNumber(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  // Keep dotted hierarchies like 12.3.1 intact; strip only leading zeros per segment.
  return t
    .split('.')
    .map((part) => {
      const n = Number(part);
      return Number.isFinite(n) ? String(n) : part;
    })
    .join('.');
}

/** Serialize structured detection results into controlled Markdown. */
export function structureToMarkdown(draft: MarkdownBookDraft): string {
  const lines: string[] = [];
  lines.push(`# BOOK: ${escapeOneLine(draft.meta.title || 'Untitled')}`);
  if (draft.meta.author) lines.push(`> AUTHOR: ${escapeOneLine(draft.meta.author)}`);
  if (draft.languages.length) {
    lines.push(`> LANGUAGES: ${draft.languages.join(', ')}`);
  }
  if (draft.documentType) lines.push(`> DOCUMENT_TYPE: ${draft.documentType}`);
  if (draft.pageCount != null) lines.push(`> PAGES: ${draft.pageCount}`);
  if (draft.meta.description) {
    lines.push(`> DESCRIPTION: ${escapeOneLine(draft.meta.description)}`);
  }
  lines.push('');

  if (draft.introductionText.trim()) {
    lines.push('## INTRODUCTION');
    lines.push('');
    lines.push(draft.introductionText.trim());
    lines.push('');
  }

  for (const ch of draft.chapters) {
    // Format: ## CHAPTER <digits> — <title>
    // Em-dash separator keeps multi-digit numbers unambiguous vs title text.
    const num = normalizeNumber(ch.number || '') || '?';
    const title = escapeOneLine(ch.title || '');
    lines.push(title ? `## CHAPTER ${num} — ${title}` : `## CHAPTER ${num}`);
    lines.push('');
    if (ch.rawText.trim() && ch.sections.length === 0) {
      lines.push(ch.rawText.trim());
      lines.push('');
    }
    for (const sec of ch.sections) {
      const sNum = normalizeNumber(sec.number || '') || '?';
      const sTitle = escapeOneLine(sec.title || '');
      lines.push(sTitle ? `### SECTION ${sNum} — ${sTitle}` : `### SECTION ${sNum}`);
      lines.push('');
      if (sec.rawText.trim()) {
        lines.push(sec.rawText.trim());
        lines.push('');
      }
    }
  }

  return lines.join('\n').trim() + '\n';
}

function parseHeadingMeta(line: string): { kind: 'chapter' | 'section' | 'intro'; num: string; title: string } | null {
  if (/^##\s+INTRODUCTION\s*$/i.test(line)) {
    return { kind: 'intro', num: '', title: 'Introduction' };
  }

  // Preferred: ## CHAPTER 11 — Title  (also accepts : - –)
  // Number group is digits only so "11" / "100" never truncates.
  const ch =
    new RegExp(`^##\\s+CHAPTER\\s+${NUM}\\s*[—–:\\-]\\s*(.+)$`, 'i').exec(line) ||
    new RegExp(`^##\\s+CHAPTER\\s+${NUM}\\s*$`, 'i').exec(line) ||
    // Legacy colon / bare formats from older imports
    new RegExp(`^##\\s+CHAPTER(?:\\s+${NUM})?(?:\\s*:\\s*(.*))?$`, 'i').exec(line);
  if (ch) {
    const num = normalizeNumber(ch[1] || '');
    const title = (ch[2] || '').trim();
    return {
      kind: 'chapter',
      num,
      title: title || (num ? `Chapter ${num}` : 'Chapter'),
    };
  }

  const sec =
    new RegExp(`^###\\s+SECTION\\s+${NUM}\\s*[—–:\\-]\\s*(.+)$`, 'i').exec(line) ||
    new RegExp(`^###\\s+SECTION\\s+${NUM}\\s*$`, 'i').exec(line) ||
    new RegExp(`^###\\s+SECTION(?:\\s+${NUM})?(?:\\s*:\\s*(.*))?$`, 'i').exec(line);
  if (sec) {
    const num = normalizeNumber(sec[1] || '');
    const title = (sec[2] || '').trim();
    return {
      kind: 'section',
      num,
      title: title || 'Content',
    };
  }
  return null;
}

/** Parse controlled Markdown back into DetectedChapter structures. */
export function markdownToStructure(markdown: string): {
  meta: DetectedMeta;
  languages: BookLanguage[];
  documentType?: DocumentType;
  pageCount?: number;
  introductionText: string;
  chapters: DetectedChapter[];
} {
  const lines = markdown.split(/\r?\n/);
  const meta: DetectedMeta = { title: '', author: '', description: '' };
  const languages: BookLanguage[] = [];
  let documentType: DocumentType | undefined;
  let pageCount: number | undefined;
  let introductionText = '';
  const chapters: DetectedChapter[] = [];

  let mode: 'meta' | 'intro' | 'chapter' | 'section' = 'meta';
  let currentChapter: DetectedChapter | null = null;
  let currentSection: DetectedSection | null = null;
  let buf: string[] = [];

  const flushBuf = () => {
    const text = buf.join('\n').trim();
    buf = [];
    if (!text) return;
    if (mode === 'intro') {
      introductionText = introductionText ? `${introductionText}\n\n${text}` : text;
    } else if (mode === 'section' && currentSection) {
      currentSection.rawText = currentSection.rawText
        ? `${currentSection.rawText}\n\n${text}`
        : text;
    } else if (mode === 'chapter' && currentChapter) {
      currentChapter.rawText = currentChapter.rawText
        ? `${currentChapter.rawText}\n\n${text}`
        : text;
    }
  };

  for (const raw of lines) {
    const line = raw;

    if (line.startsWith('# BOOK:')) {
      meta.title = line.replace(/^#\s*BOOK:\s*/i, '').trim();
      continue;
    }
    if (line.startsWith('> AUTHOR:')) {
      meta.author = line.replace(/^>\s*AUTHOR:\s*/i, '').trim();
      continue;
    }
    if (line.startsWith('> LANGUAGES:')) {
      const parts = line
        .replace(/^>\s*LANGUAGES:\s*/i, '')
        .split(/[,/]/)
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);
      for (const p of parts) {
        if (p === 'en' || p === 'ar' || p === 'ur' || p === 'mixed' || p === 'unknown') {
          languages.push(p);
        }
      }
      continue;
    }
    if (line.startsWith('> DOCUMENT_TYPE:')) {
      const t = line.replace(/^>\s*DOCUMENT_TYPE:\s*/i, '').trim().toLowerCase();
      if (t === 'text' || t === 'scanned' || t === 'mixed') documentType = t;
      continue;
    }
    if (line.startsWith('> PAGES:')) {
      const n = Number(line.replace(/^>\s*PAGES:\s*/i, '').trim());
      if (!Number.isNaN(n) && n >= 0) pageCount = n;
      continue;
    }
    if (line.startsWith('> DESCRIPTION:')) {
      meta.description = line.replace(/^>\s*DESCRIPTION:\s*/i, '').trim();
      continue;
    }

    const heading = parseHeadingMeta(line.trim());
    if (heading) {
      flushBuf();
      if (heading.kind === 'intro') {
        if (currentSection && currentChapter) currentChapter.sections.push(currentSection);
        currentSection = null;
        if (currentChapter) chapters.push(currentChapter);
        currentChapter = null;
        mode = 'intro';
        continue;
      }
      if (heading.kind === 'chapter') {
        if (currentSection && currentChapter) currentChapter.sections.push(currentSection);
        currentSection = null;
        if (currentChapter) chapters.push(currentChapter);
        currentChapter = {
          number: heading.num,
          title: heading.title,
          description: '',
          rawText: '',
          sections: [],
        };
        mode = 'chapter';
        continue;
      }
      if (heading.kind === 'section' && currentChapter) {
        if (currentSection) currentChapter.sections.push(currentSection);
        currentSection = {
          number: heading.num,
          title: heading.title,
          rawText: '',
        };
        mode = 'section';
        continue;
      }
    }

    if (mode === 'meta') continue;
    buf.push(line);
  }

  flushBuf();
  if (currentSection && currentChapter) currentChapter.sections.push(currentSection);
  if (currentChapter) chapters.push(currentChapter);

  // Chapters with body text but no sections → one content section (not fake 1.1 hierarchy)
  for (const ch of chapters) {
    if (ch.sections.length === 0 && ch.rawText.trim()) {
      ch.sections = [
        {
          number: ch.number || '',
          title: 'Content',
          rawText: ch.rawText,
        },
      ];
      ch.rawText = '';
    }
  }

  return { meta, languages, documentType, pageCount, introductionText, chapters };
}
