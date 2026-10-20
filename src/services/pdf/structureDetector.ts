/**
 * Language-aware, contextual structure detection for Islamic books.
 * NEVER invents fake chapters (e.g. every 5 pages) or fake word-count sections.
 */

import type { DetectedChapter, DetectedMeta, DetectedSection } from '@/lib/pdfExtractor';
import { cleanChapterTitle } from '@/lib/chapterTitle';
import { detectLanguage } from './language';
import type { NormalizedBlock, NormalizedPage, StructureNode } from './types';

// ─── English ──────────────────────────────────────────────────────────────────

const WORD_NUMBER =
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth';

const EN_CHAPTER = [
  new RegExp(String.raw`^(chapter|part|lesson|unit|book)\s+(\d+|[ivxlcdm]+|${WORD_NUMBER})\b\s*[:\-–—.]?\s*(.*)$`, 'i'),
  /^(\d{1,3})\s*[:\-–—.]\s+([A-Z][\w\s,'’\-–—]{2,80})$/,
  /^([IVXLC]{1,8})\s*[:\-–—.]\s+([A-Z].{2,80})$/,
];

const EN_SECTION = [
  /^(\d+\.\d+(?:\.\d+)?)\s*[:\-–—.]?\s*(.{2,90})$/,
];

/** "(58) Sūrat al-Mujādilah", "Surah Al-Fatiha", "Soorah 112" — each Surah is a chapter in tafsir works */
const SURAH_HEADING = /^\W{0,2}(?:[()]\s*(\d{1,3})\s*[()]\s*)?(?:s[uūû]rah?|s[uūû]rat|soorah)\s+\S.{0,60}$/i;
/** Banner text as misread by OCR / damaged fonts: "(64) Strat at-…", "K3 Sarat al-…" — only trusted on large-font headings */
const SURAH_LOOSE = /^[\W_]{0,3}(?:\(?\s*\w{1,3}\s*\)?\s*){0,2}[\W_]{0,3}s\S{0,3}?r(at|ah)\b\s+(?:a[lnrstdz]h?[-‘'\s]|\S)/i;

/** "(58) Sūrat al-Mujādilah" in any of its OCR spellings → "Sūrat al-Mujādilah" */
export function normalizeSurahTitle(title: string): string {
  if (!SURAH_LOOSE.test(title)) return title;
  return cleanHeadingTitle(title.replace(/^[\W_]{0,3}(?:\(?\s*\w{1,3}\s*\)?\s*){0,2}[\W_]{0,3}(?=s)/i, ''))
    .replace(/^s\S{0,3}?r(at|ah)\b/i, (_m, end: string) => `Sūr${end.toLowerCase()}`);
}

/** "The Book of Purification", "Kitab al-Salah" — chapter-level in fiqh / hadith works */
const EN_BOOK_OF = /^(?:the\s+)?(?:book|kitab|kitaab)\s+(?:of\s+|al-|ul-|an-|as-|at-|ar-)\S.{1,70}$/i;
/** "Chapter: What has come regarding…" / "Bab: …" — un-numbered sub-chapter (baab) */
const EN_BAAB = /^(?:chapter|bab|baab)\s*[:\-–—]\s*(\S.{2,110})$/i;

const EN_INTRO =
  /^(introduction|preface|foreword|prologue|author'?s?\s+introduction|translator'?s?\s+introduction)\b/i;

// ─── Arabic ───────────────────────────────────────────────────────────────────

const AR_CHAPTER = [
  /^(الكتاب|الباب|الفصل|الجزء|القسم|الدرس)\s+(.+)$/,
  /^(باب|فصل|جزء|قسم|درس)\s+(.+)$/,
];

const AR_SECTION = [
  /^(المبحث|المطلب|المسألة|الفرع)\s+(.+)$/,
];

const AR_INTRO = /^(مقدمة|المقدمة|تمهيد|تمهيدات)\b/;

// ─── Urdu ─────────────────────────────────────────────────────────────────────

const UR_CHAPTER = [
  /^(کتاب|باب|فصل|حصہ|جزو|سبق)\s+(.+)$/,
];

const UR_SECTION = [
  /^(مبحث|مطلب|مسئلہ)\s+(.+)$/,
];

const UR_INTRO = /^(مقدمہ|تمہید|پیش\s*لفظ)\b/;

export type HeadingConfidence = 'high' | 'medium' | 'low';

export interface DetectedHeading {
  kind: 'introduction' | 'chapter' | 'section' | 'subsection';
  number: string;
  title: string;
  confidence: HeadingConfidence;
  language: 'en' | 'ar' | 'ur';
  raw: string;
}

/** Strip footnote marks ("[1]"), stray bars/underscores and edge punctuation from a heading. */
export function cleanHeadingTitle(t: string): string {
  return t
    .replace(/\[\d{1,3}\]/g, '')
    .replace(/(\p{L})\d{1,2}$/u, '$1') // footnote digit glued to the last word
    .replace(/[|_]+/g, ' ')
    .replace(/(\S+(?:\s+\S+)?)\s+\1(?=\s|$)/g, '$1') // "an-Nas an-Nas" → "an-Nas"
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—:;,.'’*]+|[\s\-–—:;,'’*]+$/g, '')
    .trim();
}

function trimTitle(t: string): string {
  return t.replace(/^[:\-–—.\s]+/, '').replace(/[:\-–—.\s]+$/, '').trim();
}

export function matchHeadingLine(line: string): DetectedHeading | null {
  const text = line.trim();
  if (!text || text.length > 120) return null;
  const lang = detectLanguage(text);

  // Introduction (genuine only)
  if (EN_INTRO.test(text) && text.length < 80) {
    return { kind: 'introduction', number: '', title: text, confidence: 'high', language: 'en', raw: text };
  }
  if (AR_INTRO.test(text) && text.length < 80) {
    return { kind: 'introduction', number: '', title: text, confidence: 'high', language: 'ar', raw: text };
  }
  if (UR_INTRO.test(text) && text.length < 80) {
    return { kind: 'introduction', number: '', title: text, confidence: 'high', language: 'ur', raw: text };
  }

  // Arabic chapter / section
  if (lang === 'ar' || /[\u0600-\u06FF]/.test(text)) {
    for (const pat of AR_SECTION) {
      const m = pat.exec(text);
      if (m) {
        return {
          kind: 'section',
          number: '',
          title: trimTitle(text),
          confidence: 'high',
          language: 'ar',
          raw: text,
        };
      }
    }
    for (const pat of AR_CHAPTER) {
      const m = pat.exec(text);
      if (m) {
        return {
          kind: 'chapter',
          number: '',
          title: trimTitle(text),
          confidence: 'high',
          language: 'ar',
          raw: text,
        };
      }
    }
  }

  // Urdu
  if (lang === 'ur') {
    for (const pat of UR_SECTION) {
      const m = pat.exec(text);
      if (m) {
        return {
          kind: 'section',
          number: '',
          title: trimTitle(text),
          confidence: 'high',
          language: 'ur',
          raw: text,
        };
      }
    }
    for (const pat of UR_CHAPTER) {
      const m = pat.exec(text);
      if (m) {
        return {
          kind: 'chapter',
          number: '',
          title: trimTitle(text),
          confidence: 'high',
          language: 'ur',
          raw: text,
        };
      }
    }
  }

  // English numbered section (1.1, 1.1.1)
  for (const pat of EN_SECTION) {
    const m = pat.exec(text);
    if (m) {
      const dots = (m[1].match(/\./g) || []).length;
      return {
        kind: dots >= 2 ? 'subsection' : 'section',
        number: m[1],
        title: trimTitle(m[2] || ''),
        confidence: 'high',
        language: 'en',
        raw: text,
      };
    }
  }

  const surah = SURAH_HEADING.exec(text);
  if (surah && text.length <= 80 && !/[.,;]$/.test(text)) {
    const title = normalizeSurahTitle(text);
    const number = surah[1] ?? '';
    return { kind: 'chapter', number, title, confidence: 'high', language: 'en', raw: text };
  }
  if (EN_BAAB.test(text)) {
    return { kind: 'section', number: '', title: trimTitle(EN_BAAB.exec(text)![1]), confidence: 'medium', language: 'en', raw: text };
  }
  if (EN_BOOK_OF.test(text) && text.length <= 80 && !/[.,;]$/.test(text)) {
    return { kind: 'chapter', number: '', title: text, confidence: 'medium', language: 'en', raw: text };
  }

  // English chapter
  for (const pat of EN_CHAPTER) {
    const m = pat.exec(text);
    if (m) {
      if (pat === EN_CHAPTER[0]) {
        return {
          kind: 'chapter',
          number: m[2] || '',
          title: trimTitle(m[3] || ''),
          confidence: 'high',
          language: 'en',
          raw: text,
        };
      }
      return {
        kind: 'chapter',
        number: m[1] || '',
        title: trimTitle(m[2] || ''),
        confidence: 'medium',
        language: 'en',
        raw: text,
      };
    }
  }

  // Short ALL-CAPS — low confidence unless reinforced later
  if (
    text.length <= 70 &&
    text === text.toUpperCase() &&
    /^[A-Z]/.test(text) &&
    text.split(/\s+/).length >= 2 &&
    text.split(/\s+/).length <= 10 &&
    !/[.!?]$/.test(text)
  ) {
    return {
      kind: 'chapter',
      number: '',
      title: text,
      confidence: 'low',
      language: 'en',
      raw: text,
    };
  }

  return null;
}

/** Flatten a weak chapter node into body paragraphs (keeps all text). */
function demoteChapterToParagraphs(n: StructureNode): StructureNode[] {
  const heading =
    n.title || n.content
      ? [{ kind: 'paragraph' as const, content: [n.title, n.content].filter(Boolean).join(' ').trim(), confidence: 'low' as const }]
      : [];
  return [...heading, ...(n.children ?? [])];
}

/** Boost confidence when the same heading pattern repeats across the document. */
function reinforceConfidence(nodes: StructureNode[]): StructureNode[] {
  // Explicit chapters ("Chapter 3", "الباب …", Surah headings) only
  const explicitCount = nodes.filter((n) => n.kind === 'chapter' && n.confidence === 'high').length;

  if (explicitCount >= 2) {
    // Keep high-confidence chapters; demote invented medium/low so TOC stays real
    const filtered: StructureNode[] = [];
    for (const n of nodes) {
      if (n.kind === 'chapter' && n.confidence !== 'high') {
        const demoted = demoteChapterToParagraphs(n);
        const host = filtered[filtered.length - 1];
        if (host && (host.kind === 'chapter' || host.kind === 'introduction')) {
          host.children = [...(host.children ?? []), ...demoted];
        } else {
          filtered.push(...demoted);
        }
      } else {
        filtered.push(n);
      }
    }
    return filtered;
  }

  // No (or only one) genuine chapter heading in the PDF → do not invent a TOC.
  // Demote every chapter node so content stays continuous page order.
  if (explicitCount < 2) {
    const filtered: StructureNode[] = [];
    for (const n of nodes) {
      if (n.kind === 'chapter' && n.confidence !== 'high') {
        const demoted = demoteChapterToParagraphs(n);
        const host = filtered[filtered.length - 1];
        if (host && (host.kind === 'chapter' || host.kind === 'introduction')) {
          host.children = [...(host.children ?? []), ...demoted];
        } else {
          filtered.push(...demoted);
        }
      } else if (n.kind === 'chapter' && explicitCount === 0) {
        // Should not happen (high with count 0), but keep text
        filtered.push(...demoteChapterToParagraphs(n));
      } else if (n.kind === 'chapter' && n.confidence === 'high' && explicitCount === 1) {
        // A single real chapter is fine — keep it
        filtered.push(n);
      } else {
        filtered.push(n);
      }
    }
    return filtered;
  }

  return nodes;
}

/** Table-of-contents entry: dot leaders or a title followed by a page number. */
const TOC_LINE = /(?:\.\s?){3,}\s*\d{1,4}\s*$|…+\s*\d{1,4}\s*$|\s{2,}\d{1,4}\s*$/;

function isTocPage(page: NormalizedPage): boolean {
  const lines = page.blocks.flatMap((b) => b.text.split('\n'));
  const tocLike = lines.filter((l) => TOC_LINE.test(l.trim())).length;
  return tocLike >= 4 && tocLike >= lines.length * 0.4;
}

/** Comparable form of a heading: no "Chapter 3:" prefix, numbering or punctuation. */
export function headingMatchKey(text: string): string {
  return text
    .toLowerCase()
    .replace(new RegExp(String.raw`^(chapter|part|book|lesson|unit|section)\s+(\d+|[ivxlcdm]+|${WORD_NUMBER})\b\s*[:\-–—.]?\s*`, 'i'), '')
    .replace(/^(\d+(\.\d+)*|[ivxlc]+)[.):\-–—]?\s+/i, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** "chapter#3" for "Chapter 3", "Chapter 3: Title", "CHAPTER THREE" (digits only). */
function chapterNumberKey(text: string): string | null {
  const m = /^(chapter|part|book)\s+(\d+)\b/i.exec(text.trim());
  return m ? `${m[1].toLowerCase()}#${Number(m[2])}` : null;
}

function sameTitle(a?: string, b?: string): boolean {
  const norm = (t?: string) => (t ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return !!a && !!b && norm(a) === norm(b);
}

export interface TocHint {
  title: string;
  level: 1 | 2;
}

export function detectStructureFromPages(pages: NormalizedPage[], toc: TocHint[] = []): StructureNode[] {
  const nodes: StructureNode[] = [];

  // ── Contents-page guidance ────────────────────────────────────────────────
  // When the book's own contents page matches the headings in the body, only
  // those headings become chapters / sections — no guessing from ALL-CAPS
  // lines, numbered list items or running headers.
  const tocLevels = new Map<string, 1 | 2>();
  for (const e of toc) {
    const key = headingMatchKey(e.title);
    if (key && !tocLevels.has(key)) tocLevels.set(key, e.level);
    const num = chapterNumberKey(e.title);
    if (num && !tocLevels.has(num)) tocLevels.set(num, 1);
  }
  const tocLookup = (text: string): 1 | 2 | undefined =>
    tocLevels.get(headingMatchKey(text)) ?? (chapterNumberKey(text) ? tocLevels.get(chapterNumberKey(text)!) : undefined);
  const matchedToc = new Set<string>();
  for (const page of pages) {
    for (const b of page.blocks) {
      if (b.type === 'possible-heading' && tocLookup(b.text)) matchedToc.add(headingMatchKey(b.text));
    }
  }
  const tocMode = toc.length >= 3 && matchedToc.size >= Math.max(2, Math.ceil(toc.length * 0.4));

  /** Chapter opened by a number-only heading ("Chapter 1") waiting for its title line */
  let awaitingTitle: StructureNode | null = null;
  /** Chapter just opened by its heading: a smaller heading right below it is its subtitle */
  let awaitingSubtitle: StructureNode | null = null;
  let currentChapter: StructureNode | null = null;
  let currentSection: StructureNode | null = null;
  let currentSubsection: StructureNode | null = null;
  let inIntroduction = false;
  let introNode: StructureNode | null = null;

  const pushParagraph = (text: string, type: NormalizedBlock['type'] = 'text') => {
    if (!text.trim()) return;
    const node: StructureNode = {
      kind: type === 'quote' ? 'quote' : type === 'list' ? 'list' : 'paragraph',
      content: text.trim(),
      confidence: 'high',
      language: detectLanguage(text),
    };

    if (inIntroduction && introNode) {
      introNode.children = introNode.children ?? [];
      introNode.children.push(node);
      return;
    }
    if (currentSubsection) {
      currentSubsection.children = currentSubsection.children ?? [];
      currentSubsection.children.push(node);
    } else if (currentSection) {
      currentSection.children = currentSection.children ?? [];
      currentSection.children.push(node);
    } else if (currentChapter) {
      currentChapter.children = currentChapter.children ?? [];
      currentChapter.children.push(node);
    } else {
      nodes.push(node);
    }
  };

  const startIntro = (title: string, confidence: HeadingConfidence) => {
    inIntroduction = true;
    currentChapter = null;
    currentSection = null;
    currentSubsection = null;
    introNode = {
      kind: 'introduction',
      title,
      content: '',
      confidence,
      children: [],
    };
    nodes.push(introNode);
  };

  const startChapter = (num: string, title: string, confidence: HeadingConfidence) => {
    // Running header repeating the open chapter's heading on every page
    const open = currentChapter as StructureNode | null;
    if (open && sameTitle(open.title, title || (num ? `Chapter ${num}` : '')) && (open.content || '') === num) {
      return;
    }
    inIntroduction = false;
    introNode = null;
    currentSection = null;
    currentSubsection = null;
    currentChapter = {
      kind: 'chapter',
      title: title ? normalizeSurahTitle(cleanHeadingTitle(title)) || title : num ? `Chapter ${num}` : 'Chapter',
      content: num,
      confidence,
      children: [],
    };
    nodes.push(currentChapter);
  };

  const startSection = (num: string, title: string, confidence: HeadingConfidence) => {
    if (!currentChapter) {
      // Section without chapter — open a container chapter from first real heading only
      // Do NOT invent "Chapter 1"; use a neutral container only when a section pattern is high-confidence
      if (confidence === 'high') {
        startChapter('', 'Contents', 'medium');
      } else {
        pushParagraph(title);
        return;
      }
    }
    currentSubsection = null;
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

  const startSubsection = (num: string, title: string, confidence: HeadingConfidence) => {
    if (!currentSection) {
      startSection(num.split('.').slice(0, 2).join('.'), title, confidence);
    }
    if (!currentSection) return;
    currentSubsection = {
      kind: 'subsection',
      title,
      content: num,
      confidence,
      children: [],
    };
    currentSection.children = currentSection.children ?? [];
    currentSection.children.push(currentSubsection);
  };

  pages.forEach((page, pageIdx) => {
    // Table of contents pages: drop the entry lines (the reader has its own TOC)
    const tocPage = pageIdx < 30 && isTocPage(page);

    page.blocks.forEach((block, blockIdx) => {
      const line = block.text.trim();
      if (!line) return;
      if (tocPage && TOC_LINE.test(line)) return;

      const preferHeading = block.type === 'possible-heading';

      // Two-line chapter heading: "Chapter 1" then "The Pillars of Faith"
      if (awaitingTitle) {
        const waiting = awaitingTitle;
        awaitingTitle = null;
        const next = matchHeadingLine(line);
        const isOwnHeading = next && next.confidence === 'high' && next.kind !== 'chapter';
        if (block.type === 'possible-heading' && !isOwnHeading && !(next?.kind === 'chapter' && next.number)) {
          waiting.title = line;
          return;
        }
      }

      // "Sūrat al-Mujādilah" + "The Arguing (or Pleading Woman)" → one chapter title
      if (awaitingSubtitle && /^[\d\W]{1,4}$/.test(line)) return; // stray marker between banner and subtitle
      if (awaitingSubtitle) {
        const chapter = awaitingSubtitle;
        awaitingSubtitle = null;
        const own = matchHeadingLine(line);
        // Never glue two chapter-like headings: "Chapter 10 — Chapter Two"
        const lineLooksLikeChapter = /^(?:chapter|part|book)\s+/i.test(line.trim());
        const existingLooksLikeChapter = /^(?:chapter|part|book)\s+/i.test(
          (chapter.title ?? '').trim(),
        );
        if (
          block.type === 'possible-heading' &&
          block.headingLevel === 2 &&
          !own &&
          !lineLooksLikeChapter &&
          (chapter.children ?? []).length === 0
        ) {
          const base = cleanHeadingTitle(chapter.title ?? '');
          const next = cleanHeadingTitle(line);
          // Replace a bare "Chapter N" title with the real subtitle
          if (existingLooksLikeChapter && !/^(?:chapter|part|book)\s+/i.test(next)) {
            chapter.title = next;
          } else if (!existingLooksLikeChapter) {
            chapter.title = next ? `${base} — ${next}` : base;
          }
          return;
        }
        if (lineLooksLikeChapter && own?.kind === 'chapter') {
          // Fall through — treat as a new chapter heading
        } else if (lineLooksLikeChapter) {
          return;
        }
      }

      let heading = matchHeadingLine(line);

      if (tocMode && block.type === 'possible-heading') {
        const level = tocLookup(line);
        if (level) {
          const num = heading?.number ?? '';
          const title = heading && heading.kind !== 'introduction' && heading.title ? heading.title : line;
          if (level === 1 && (heading?.kind === 'introduction')) {
            startIntro(heading.title, 'high');
          } else if (level === 1) {
            startChapter(num, title, 'high');
            if (heading?.kind === 'chapter' && !heading.title) awaitingTitle = currentChapter;
          } else {
            startSection(heading?.number ?? '', title, 'high');
          }
          return;
        }
        // Not in the contents: a larger-font line is a sub-heading inside the chapter
        if (block.headingLevel && (currentChapter || inIntroduction)) {
          if (currentSection) startSubsection('', line, 'medium');
          else if (currentChapter) startSection('', line, 'medium');
          else pushParagraph(line, 'text');
          return;
        }
        if (!heading || heading.confidence !== 'high') {
          pushParagraph(line, 'text');
          return;
        }
      }

      // ALL-CAPS lines are only chapters when set apart: larger font or top of a page
      if (heading && heading.confidence === 'low' && !block.headingLevel && blockIdx > 0) {
        pushParagraph(line, block.type === 'possible-heading' ? 'text' : block.type);
        return;
      }
      // Larger-font line: only a section under a real chapter — never invent chapters from font size alone
      if (block.headingLevel && pageIdx > 0 && block.type === 'possible-heading') {
        if (!heading) {
          if (currentChapter) {
            heading = {
              kind: block.headingLevel === 1 ? 'section' : 'subsection',
              number: '',
              title: line,
              confidence: 'medium',
              language: 'en',
              raw: line,
            };
          } else {
            pushParagraph(line, 'text');
            return;
          }
        } else if (heading.confidence === 'low' && heading.kind !== 'chapter') {
          heading = { ...heading, confidence: 'medium' };
        } else if (heading.confidence === 'low' && heading.kind === 'chapter' && !currentChapter) {
          // Lone ALL-CAPS without a real chapter pattern — keep as body
          pushParagraph(line, 'text');
          return;
        }
      }

      if (heading && (preferHeading || (heading.confidence === 'high' && line.length <= 80))) {
        // Skip low-confidence mid-paragraph noise unless marked as heading
        if (heading.confidence === 'low' && block.type !== 'possible-heading') {
          pushParagraph(line, block.type);
          return;
        }

        if (heading.kind === 'introduction') {
          startIntro(heading.title, heading.confidence);
          return;
        }
        if (heading.kind === 'chapter') {
          startChapter(heading.number, heading.title || heading.raw, heading.confidence);
          if (!heading.title && heading.number) awaitingTitle = currentChapter;
          else awaitingSubtitle = currentChapter;
          return;
        }
        if (heading.kind === 'section') {
          startSection(heading.number, heading.title || heading.raw, heading.confidence);
          return;
        }
        if (heading.kind === 'subsection') {
          startSubsection(heading.number, heading.title || heading.raw, heading.confidence);
          return;
        }
      }

      pushParagraph(line, block.type);
    });
  });

  return reinforceConfidence(nodes);
}

function collectText(nodes: StructureNode[]): string {
  const parts: string[] = [];
  for (const n of nodes) {
    if (n.content && (n.kind === 'paragraph' || n.kind === 'quote' || n.kind === 'list')) {
      parts.push(n.content);
    }
    if (n.children?.length) parts.push(collectText(n.children));
  }
  return parts.filter(Boolean).join('\n\n');
}

/**
 * Convert structure nodes to DetectedChapter[].
 * If no genuine chapters: one "Complete Text" chapter — NEVER fake page-based chapters.
 * If a chapter has no real sections: one "Content" section holding body text — NEVER word-count sections.
 */
export function structureToDetectedChapters(
  nodes: StructureNode[],
  _pages: NormalizedPage[],
): DetectedChapter[] {
  const chapterNodes = nodes.filter((n) => n.kind === 'chapter');

  if (chapterNodes.length === 0) {
    const body = collectText(nodes.filter((n) => n.kind !== 'introduction'));
    if (!body.trim()) return [];
    return [
      {
        number: '1',
        title: 'Complete Text',
        description: '',
        rawText: '',
        sections: [
          {
            number: '1',
            title: 'Content',
            rawText: body,
          },
        ],
      },
    ];
  }

  // Keep page-order text that sits outside chapter nodes (never drop it)
  const firstChapterIdx = nodes.findIndex((n) => n.kind === 'chapter');
  const lastChapterIdx = nodes.length - 1 - [...nodes].reverse().findIndex((n) => n.kind === 'chapter');
  const leadingRaw =
    firstChapterIdx > 0
      ? collectText(nodes.slice(0, firstChapterIdx).filter((n) => n.kind !== 'introduction'))
      : '';
  // Long leading matter is stored as Introduction; keep short leading so it is not lost
  const leadingOrphans = leadingRaw.trim().length >= 200 ? '' : leadingRaw;
  const trailingOrphans =
    lastChapterIdx >= 0 && lastChapterIdx < nodes.length - 1
      ? collectText(nodes.slice(lastChapterIdx + 1).filter((n) => n.kind !== 'introduction'))
      : '';

  return chapterNodes.map((ch, ci) => {
    const sectionNodes = (ch.children ?? []).filter((c) => c.kind === 'section');
    const bodyParagraphs = (ch.children ?? []).filter(
      (c) => c.kind === 'paragraph' || c.kind === 'quote' || c.kind === 'list',
    );
    let chapterBody = collectText(bodyParagraphs);
    if (ci === 0 && leadingOrphans.trim()) {
      chapterBody = `${leadingOrphans.trim()}\n\n${chapterBody}`.trim();
    }
    if (ci === chapterNodes.length - 1 && trailingOrphans.trim()) {
      chapterBody = `${chapterBody}\n\n${trailingOrphans.trim()}`.trim();
    }

    const sections: DetectedSection[] = sectionNodes.map((sec, si) => {
      const subText = collectText(
        (sec.children ?? []).filter((c) => c.kind === 'subsection'),
      );
      const own = collectText(
        (sec.children ?? []).filter((c) => c.kind !== 'subsection'),
      );
      const raw = [own, subText].filter(Boolean).join('\n\n');
      // Flatten subsections into section content with markdown-like markers preserved in text
      const subBlocks = (sec.children ?? []).filter((c) => c.kind === 'subsection');
      let combined = own;
      for (const sub of subBlocks) {
        const subBody = collectText(sub.children ?? []);
        combined += `\n\n${sub.title || sub.content}\n\n${subBody}`;
      }
      return {
        number: sec.content || '',
        title: sec.title || `Section ${si + 1}`,
        rawText: combined.trim() || raw,
      };
    });

    if (sections.length === 0) {
      return {
        number: ch.content || String(ci + 1),
        title: cleanChapterTitle(ch.title || `Chapter ${ci + 1}`),
        description: '',
        rawText: '',
        sections: [
          {
            number: ch.content || String(ci + 1),
            title: 'Content',
            rawText: chapterBody || collectText(ch.children ?? []),
          },
        ],
      };
    }

    // Prepend orphan chapter paragraphs before first section
    if (chapterBody.trim()) {
      sections[0] = {
        ...sections[0],
        rawText: `${chapterBody.trim()}\n\n${sections[0].rawText}`.trim(),
      };
    }

    return {
      number: ch.content || String(ci + 1),
      title: cleanChapterTitle(ch.title || `Chapter ${ci + 1}`),
      description: '',
      rawText: '',
      sections,
    };
  });
}

export function countLowConfidenceHeadings(nodes: StructureNode[]): number {
  let n = 0;
  const walk = (list: StructureNode[]) => {
    for (const node of list) {
      if (
        (node.kind === 'chapter' || node.kind === 'section' || node.kind === 'subsection') &&
        node.confidence === 'low'
      ) {
        n += 1;
      }
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
  return n;
}

export function extractIntroductionText(nodes: StructureNode[]): string {
  // Several intro headings (e.g. one from a contents list): use the one with the most text
  const intros = nodes.filter((n) => n.kind === 'introduction');
  const introTexts = intros.map((n) => collectText(n.children ?? [])).filter((t) => t.trim());
  if (introTexts.length > 0) {
    return introTexts.reduce((a, b) => (b.length > a.length ? b : a));
  }
  // Body text before the first chapter is the book's opening matter
  const firstChapter = nodes.findIndex((n) => n.kind === 'chapter');
  if (firstChapter > 0) {
    const leading = collectText(nodes.slice(0, firstChapter).filter((n) => n.kind !== 'introduction'));
    // A few words from the title page are not an introduction
    if (leading.trim().length >= 200) return leading;
  }
  // Genuine intro heading may have been stored as first chapter titled Introduction
  const maybe = nodes.find(
    (n) =>
      n.kind === 'chapter' &&
      n.title &&
      /^(introduction|preface|foreword|prologue|مقدمة|المقدمة|تمهيد|مقدمہ|تمہید)/i.test(n.title),
  );
  if (maybe) return collectText(maybe.children ?? []);
  return '';
}

export function detectMetaFromText(fullText: string, fileName: string): DetectedMeta {
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fileTitle = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();

  const titleLine = lines.slice(0, 25).find(
    (l) =>
      l.length >= 4 &&
      l.length <= 100 &&
      l.split(/\s+/).length <= 16 &&
      !/^\d+$/.test(l) &&
      !matchHeadingLine(l),
  );

  const authorLine = lines.slice(0, 50).find((l) =>
    /^(by|author|written by|compiled by|translated by|المؤلف|تصنیف|مولف)\s*/i.test(l),
  );
  const author = authorLine
    ? authorLine
        .replace(/^(by|author|written by|compiled by|translated by|المؤلف|تصنیف|مولف)\s*[:：]?\s*/i, '')
        .trim()
    : '';

  const descLine = lines.slice(0, 60).find(
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
