/**
 * Language-aware, contextual structure detection for Islamic books.
 * NEVER invents fake chapters (e.g. every 5 pages) or fake word-count sections.
 */

import type { DetectedChapter, DetectedMeta, DetectedSection } from '@/lib/pdfExtractor';
import { detectLanguage } from './language';
import type { NormalizedBlock, NormalizedPage, StructureNode } from './types';

// ─── English ──────────────────────────────────────────────────────────────────

const EN_CHAPTER = [
  /^(chapter|part|lesson|unit|book)\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.*)$/i,
  /^(\d{1,3})\s*[:\-–—.]\s+([A-Z][\w\s,'’\-–—]{2,80})$/,
  /^([IVXLC]{1,8})\s*[:\-–—.]\s+([A-Z].{2,80})$/,
];

const EN_SECTION = [
  /^(\d+\.\d+(?:\.\d+)?)\s*[:\-–—.]?\s*(.{2,90})$/,
];

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

  // English chapter
  for (const pat of EN_CHAPTER) {
    const m = pat.exec(text);
    if (m) {
      if (pat.source.startsWith('^(chapter')) {
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

/** Boost confidence when the same heading pattern repeats across the document. */
function reinforceConfidence(nodes: StructureNode[]): StructureNode[] {
  const chapterTitles = nodes.filter((n) => n.kind === 'chapter').map((n) => n.title || '');
  const explicitCount = chapterTitles.filter((t) =>
    /^(chapter|part|lesson|unit|book|الباب|الفصل|باب|فصل)\b/i.test(t || ''),
  ).length;

  if (explicitCount >= 2) {
    return nodes.map((n) =>
      n.kind === 'chapter' && n.confidence === 'low'
        ? { ...n, confidence: 'medium' as const }
        : n,
    );
  }

  // Drop isolated low-confidence "chapters" that look like body sentences
  if (explicitCount === 0) {
    const filtered: StructureNode[] = [];
    for (const n of nodes) {
      if (n.kind === 'chapter' && n.confidence === 'low') {
        // Convert to paragraph — do not invent structure
        filtered.push({
          kind: 'paragraph',
          content: n.title || n.content,
          confidence: 'low',
        });
        for (const child of n.children ?? []) filtered.push(child);
      } else {
        filtered.push(n);
      }
    }
    return filtered;
  }

  return nodes;
}

export function detectStructureFromPages(pages: NormalizedPage[]): StructureNode[] {
  const nodes: StructureNode[] = [];
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
    inIntroduction = false;
    introNode = null;
    currentSection = null;
    currentSubsection = null;
    currentChapter = {
      kind: 'chapter',
      title: title || (num ? `Chapter ${num}` : 'Chapter'),
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

  for (const page of pages) {
    for (const block of page.blocks) {
      const line = block.text.trim();
      if (!line) continue;

      const preferHeading =
        block.type === 'possible-heading' ||
        block.confidence === 'high' ||
        block.confidence === 'medium';

      const heading = matchHeadingLine(line);
      if (heading && (preferHeading || heading.confidence === 'high')) {
        // Skip low-confidence mid-paragraph noise unless marked as heading
        if (heading.confidence === 'low' && block.type !== 'possible-heading') {
          pushParagraph(line, block.type);
          continue;
        }

        if (heading.kind === 'introduction') {
          startIntro(heading.title, heading.confidence);
          continue;
        }
        if (heading.kind === 'chapter') {
          startChapter(heading.number, heading.title || heading.raw, heading.confidence);
          continue;
        }
        if (heading.kind === 'section') {
          startSection(heading.number, heading.title || heading.raw, heading.confidence);
          continue;
        }
        if (heading.kind === 'subsection') {
          startSubsection(heading.number, heading.title || heading.raw, heading.confidence);
          continue;
        }
      }

      pushParagraph(line, block.type);
    }
  }

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
 * If no genuine chapters: one "Unstructured Content" chapter — NEVER fake page-based chapters.
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
        number: '',
        title: 'Unstructured Content',
        description: '',
        rawText: '',
        sections: [
          {
            number: '',
            title: 'Content',
            rawText: body,
          },
        ],
      },
    ];
  }

  return chapterNodes.map((ch, ci) => {
    const sectionNodes = (ch.children ?? []).filter((c) => c.kind === 'section');
    const bodyParagraphs = (ch.children ?? []).filter(
      (c) => c.kind === 'paragraph' || c.kind === 'quote' || c.kind === 'list',
    );
    const chapterBody = collectText(bodyParagraphs);

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
        title: ch.title || `Chapter ${ci + 1}`,
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
      title: ch.title || `Chapter ${ci + 1}`,
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
  const intro = nodes.find((n) => n.kind === 'introduction');
  if (intro) return collectText(intro.children ?? []);
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
