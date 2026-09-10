/**
 * Confidence-based semantic parser: plain text → ContentBlock[].
 * False-positive classification is worse than leaving content as a paragraph.
 */

import type { ContentBlock } from '@/types';
import { classifyScript, isPrimarilyArabic, splitMixedScript } from './arabic';
import { normalizeDisplayText, repairLineWraps } from './normalizeText';
import { segmentDenseText } from './segmentDenseText';
import {
  ALLAH_SAYS_RE,
  CHAPTER_HEADING_RE,
  DECIMAL_SECTION_RE,
  FOOTNOTE_DEF_BRACKET,
  FOOTNOTE_DEF_NUMBERED,
  HADITH_SOURCE_RE,
  HIGH,
  LETTER_HEADING_RE,
  LOW,
  MEDIUM,
  NARRATED_RE,
  NUMBERED_HEADING_RE,
  PROPHET_SAID_RE,
  SCHOLAR_INLINE_RE,
  SCHOLAR_SAID_RE,
  ACCORDING_TO_SCHOLAR,
  QURAN_LABEL_ONLY,
  FALSE_VERSE_CONTEXT,
  looksLikeBookReference,
  parseQuranReferenceLine,
} from './patterns';

interface RawLine {
  text: string;
  index: number;
}

function splitUnits(text: string): string[] {
  // First break dense space-joined PDF blobs into script/marker units
  const segmented = segmentDenseText(text).join('\n\n');
  const repaired = repairLineWraps(segmented);
  return repaired
    .split(/\n{2,}/)
    .flatMap((para) => {
      const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        // One more pass for leftover dense lines
        if (lines[0] && lines[0].length > 120) {
          return segmentDenseText(lines[0]);
        }
        return lines;
      }
      const shortCount = lines.filter((l) => l.length < 100).length;
      if (shortCount >= lines.length * 0.6) return lines;
      return segmentDenseText(lines.join(' '));
    })
    .map((u) => normalizeDisplayText(u))
    .filter(Boolean);
}

function detectHeading(line: string): { level: number; text: string; confidence: number } | null {
  const t = line.trim();
  if (t.length > 100 || t.length < 3) return null;

  let m = CHAPTER_HEADING_RE.exec(t);
  if (m) {
    const title = (m[2] || '').trim();
    // Reject prose that merely mentions a chapter ("Chapter 2 begins on page 43.")
    if (/\b(begins?|starts?|continues?|ends?|on\s+page|see\s+page)\b/i.test(title)) {
      return null;
    }
    if (t.endsWith('.') && title.split(/\s+/).length >= 4) {
      return null;
    }
    return {
      level: 1,
      text: title ? `Chapter ${m[1]}: ${title}` : t,
      confidence: 0.9,
    };
  }

  m = DECIMAL_SECTION_RE.exec(t);
  if (m && !t.endsWith('.') && m[2].split(/\s+/).length <= 14) {
    return { level: 2, text: t, confidence: 0.88 };
  }

  m = NUMBERED_HEADING_RE.exec(t);
  if (m) {
    return { level: 2, text: t, confidence: 0.82 };
  }

  m = LETTER_HEADING_RE.exec(t);
  if (m) {
    return { level: 3, text: t, confidence: 0.75 };
  }

  // ALL-CAPS short heading
  if (
    t === t.toUpperCase() &&
    /[A-Z]/.test(t) &&
    t.split(/\s+/).length >= 2 &&
    t.split(/\s+/).length <= 10 &&
    !/\d+\s*:\s*\d+/.test(t)
  ) {
    return { level: 1, text: t, confidence: 0.6 };
  }

  // Title Case short line without terminal period
  if (
    t.length <= 70 &&
    !t.endsWith('.') &&
    !t.endsWith(',') &&
    /^[A-Z\u0600-\u06FF]/.test(t) &&
    t.split(/\s+/).length <= 8 &&
    !NARRATED_RE.test(t) &&
    !PROPHET_SAID_RE.test(t)
  ) {
    // Low confidence — only promote with isolation (handled by caller via blank lines)
    return { level: 3, text: t, confidence: 0.4 };
  }

  return null;
}

function detectFootnote(line: string): ContentBlock | null {
  let m = FOOTNOTE_DEF_BRACKET.exec(line);
  if (m) {
    return { type: 'footnote', number: Number(m[1]), text: m[2].trim() };
  }
  // Numbered footnote only when it looks like a citation, not "1. Definition of…"
  m = FOOTNOTE_DEF_NUMBERED.exec(line);
  if (m) {
    const body = m[2].trim();
    const headingLike = detectHeading(`${m[1]}. ${body}`);
    if (headingLike && headingLike.confidence >= MEDIUM) return null;
    if (looksLikeBookReference(body) || /^(see|cf\.|ibid|op\.\s*cit)/i.test(body) || body.length < 180) {
      // Prefer footnote when citation-like; avoid converting every "1. Long sentence"
      if (looksLikeBookReference(body) || /^\[/.test(body) || /p\.?\s*\d+/i.test(body) || /\d+\s*\/\s*\d+/.test(body)) {
        return { type: 'footnote', number: Number(m[1]), text: body };
      }
    }
  }
  return null;
}

function isHadithSourceLine(line: string): boolean {
  return HADITH_SOURCE_RE.test(line.trim());
}

/**
 * Parse book section / introduction text into semantic ContentBlocks.
 * Safe for existing plain-text content (backward compatible).
 */
export function parseBookContent(raw: string): ContentBlock[] {
  if (!raw?.trim()) return [];

  const units = splitUnits(raw);
  const lines: RawLine[] = units.map((text, index) => ({ text, index }));
  const blocks: ContentBlock[] = [];
  const consumed = new Set<number>();

  const peek = (i: number): string | null => {
    if (i < 0 || i >= lines.length || consumed.has(i)) return null;
    return lines[i].text;
  };

  for (let i = 0; i < lines.length; i++) {
    if (consumed.has(i)) continue;
    const text = lines[i].text;

    // Standalone "Qur'an" / "QURAN" label — marker only, not body text
    if (QURAN_LABEL_ONLY.test(text)) {
      consumed.add(i);
      continue;
    }

    // Footnotes
    const fn = detectFootnote(text);
    if (fn) {
      blocks.push(fn);
      consumed.add(i);
      continue;
    }

    // Headings (medium+)
    const heading = detectHeading(text);
    if (heading && heading.confidence >= MEDIUM) {
      blocks.push({ type: 'heading', text: heading.text, level: heading.level });
      consumed.add(i);
      continue;
    }

    // Standalone book / hadith source reference
    const bookRef = looksLikeBookReference(text);
    if (bookRef && bookRef.confidence >= HIGH && text.length < 140) {
      blocks.push({ type: 'reference', text });
      consumed.add(i);
      continue;
    }

    // Qur'an reference-only line — attach to previous quran/arabic if possible
    const qRef = parseQuranReferenceLine(text);
    if (qRef && qRef.confidence >= HIGH) {
      const prev = blocks[blocks.length - 1];
      if (prev?.type === 'quran') {
        prev.reference = qRef.reference.startsWith('Qur') ? qRef.reference : `Qur’an — ${qRef.reference}`;
        consumed.add(i);
        continue;
      }
      if (prev?.type === 'arabic') {
        blocks[blocks.length - 1] = {
          type: 'quran',
          arabic: prev.text,
          reference: qRef.reference.startsWith('Qur') ? qRef.reference : `Qur’an — ${qRef.reference}`,
        };
        consumed.add(i);
        continue;
      }
      if (prev?.type === 'paragraph' && blocks.length >= 2) {
        const maybeArabic = blocks[blocks.length - 2];
        if (maybeArabic?.type === 'arabic') {
          const translation = prev.text;
          blocks.pop();
          blocks[blocks.length - 1] = {
            type: 'quran',
            arabic: maybeArabic.text,
            translation,
            reference: qRef.reference.startsWith('Qur') ? qRef.reference : `Qur’an — ${qRef.reference}`,
          };
          consumed.add(i);
          continue;
        }
      }
      blocks.push({ type: 'reference', text: qRef.reference.startsWith('Qur') ? qRef.reference : `Qur’an — ${qRef.reference}`, source: 'quran' });
      consumed.add(i);
      continue;
    }

    // Arabic / Qur'an block assembly
    const script = classifyScript(text);
    if (script.kind === 'arabic' || (script.kind === 'mixed' && script.ratio >= 0.45)) {
      let arabicText = text;
      let latinPart: string | undefined;

      if (script.kind === 'mixed') {
        const split = splitMixedScript(text);
        arabicText = split.arabic ?? text;
        latinPart = split.latin;
      }

      // Merge consecutive Arabic lines (multi-line ayah extraction)
      let look = i + 1;
      while (look < lines.length && !consumed.has(look)) {
        const more = lines[look].text;
        if (!isPrimarilyArabic(more) || more.length < 8) break;
        arabicText = `${arabicText}\n${more}`;
        consumed.add(look);
        look += 1;
      }

      const next = peek(look);
      const next2 = peek(look + 1);
      // Use raw previous line even if it was a consumed Qur'an label
      const prevText = i > 0 ? lines[i - 1].text : null;

      let translation: string | undefined;
      let reference: string | undefined;
      let confidence = 0.45;

      // Context: Allah says / QURAN label before Arabic
      if (prevText && ALLAH_SAYS_RE.test(prevText)) {
        confidence += 0.25;
      }
      if (prevText && /^Qur['’]?an$/i.test(prevText.trim())) {
        confidence += 0.3;
      }

      // Next is English translation candidate
      if (next && !isPrimarilyArabic(next) && next.length > 15 && next.length < 600) {
        const nextRef = next2 ? parseQuranReferenceLine(next2) : null;
        const nextIsRef = parseQuranReferenceLine(next);

        if (nextIsRef && nextIsRef.confidence >= MEDIUM) {
          reference = nextIsRef.reference.startsWith('Qur')
            ? nextIsRef.reference
            : `Qur’an — ${nextIsRef.reference}`;
          confidence += nextIsRef.confidence >= HIGH ? 0.4 : 0.2;
          consumed.add(look);
        } else if (!FALSE_VERSE_CONTEXT.test(next) && !isHadithSourceLine(next) && !looksLikeBookReference(next)) {
          translation = next;
          confidence += 0.2;
          consumed.add(look);

          // Multi-line translation: join short English continuations
          let tLook = look + 1;
          while (tLook < lines.length && !consumed.has(tLook)) {
            const cont = lines[tLook].text;
            if (isPrimarilyArabic(cont)) break;
            if (parseQuranReferenceLine(cont)) break;
            if (isHadithSourceLine(cont) || looksLikeBookReference(cont)) break;
            if (cont.length > 180) break;
            if (!/^[a-z(]/.test(cont) && cont.split(/\s+/).length > 12) break;
            translation = `${translation} ${cont}`;
            consumed.add(tLook);
            tLook += 1;
          }
          const afterTrans = peek(tLook);
          const afterRef = afterTrans ? parseQuranReferenceLine(afterTrans) : nextRef;

          if (afterRef && afterRef.confidence >= LOW) {
            const boost = afterRef.confidence >= HIGH ? 0.4 : afterRef.confidence >= MEDIUM ? 0.3 : 0.25;
            if (afterRef.confidence >= MEDIUM || (afterRef.confidence >= LOW && confidence >= 0.55)) {
              reference = afterRef.reference.startsWith('Qur')
                ? afterRef.reference
                : `Qur’an — ${afterRef.reference}`;
              confidence += boost;
              if (afterTrans) consumed.add(tLook);
            }
          }
        }
      }

      if (latinPart && !translation) {
        translation = latinPart;
        confidence += 0.1;
      }

      // Arabic + translation + (optional) reference is enough for Qur'an
      if (confidence >= HIGH || (confidence >= 0.6 && translation && reference) || (confidence >= MEDIUM && reference)) {
        blocks.push({
          type: 'quran',
          arabic: arabicText,
          translation,
          reference,
        });
      } else if (translation && reference) {
        blocks.push({ type: 'quran', arabic: arabicText, translation, reference });
      } else if (confidence >= MEDIUM && translation && prevText && ALLAH_SAYS_RE.test(prevText)) {
        blocks.push({ type: 'quran', arabic: arabicText, translation, reference });
      } else {
        blocks.push({ type: 'arabic', text: arabicText });
        if (translation) blocks.push({ type: 'paragraph', text: translation });
      }

      consumed.add(i);
      continue;
    }

    // Scholar quotation: "X said:" + following quote/paragraph
    if (SCHOLAR_SAID_RE.test(text) || ACCORDING_TO_SCHOLAR.test(text)) {
      const author = text.replace(/\s+said\s*:?\s*$/i, '').trim();
      const next = peek(i + 1);
      if (next && next.length > 10) {
        let quoteText = next.replace(/^["“«]|["”»]$/g, '').trim();
        let source: string | undefined;
        consumed.add(i);
        consumed.add(i + 1);
        const next2 = peek(i + 2);
        if (next2 && looksLikeBookReference(next2) && (looksLikeBookReference(next2)?.confidence ?? 0) >= MEDIUM) {
          source = next2.replace(/^[-–—]\s*/, '');
          consumed.add(i + 2);
        }
        blocks.push({ type: 'quote', text: quoteText, attribution: author, author, source });
        continue;
      }
    }

    const scholarInline = SCHOLAR_INLINE_RE.exec(text);
    if (scholarInline) {
      const author = scholarInline[1];
      const rest = (scholarInline[2] || '').trim().replace(/^["“«]|["”»]$/g, '');
      if (rest.length > 12) {
        blocks.push({ type: 'quote', text: rest, attribution: author, author });
        consumed.add(i);
        continue;
      }
    }

    // Hadith cluster
    if (NARRATED_RE.test(text) || PROPHET_SAID_RE.test(text)) {
      let hadithText = text;
      let narrator: string | undefined;
      let reference: string | undefined;

      if (NARRATED_RE.test(text) && text.length < 120) {
        narrator = text;
        const next = peek(i + 1);
        if (next && (PROPHET_SAID_RE.test(next) || next.length > 40)) {
          hadithText = next;
          consumed.add(i + 1);
          const next2 = peek(i + 2);
          if (next2 && isHadithSourceLine(next2)) {
            reference = next2.replace(/^[-–—]\s*/, '');
            consumed.add(i + 2);
          }
        }
      } else {
        const next = peek(i + 1);
        if (next && isHadithSourceLine(next)) {
          reference = next.replace(/^[-–—]\s*/, '');
          consumed.add(i + 1);
        } else if (next && NARRATED_RE.test(next) && next.length < 100) {
          narrator = next;
          consumed.add(i + 1);
          const next2 = peek(i + 2);
          if (next2 && isHadithSourceLine(next2)) {
            reference = next2.replace(/^[-–—]\s*/, '');
            consumed.add(i + 2);
          }
        }
      }

      // Only classify as hadith with decent confidence
      const conf =
        (NARRATED_RE.test(text) || PROPHET_SAID_RE.test(text) ? 0.55 : 0) +
        (reference ? 0.3 : 0) +
        (narrator ? 0.1 : 0);

      if (conf >= MEDIUM) {
        blocks.push({ type: 'hadith', text: hadithText.replace(/^["“«]|["”»]$/g, ''), narrator, reference });
        consumed.add(i);
        continue;
      }
    }

    // Quoted line
    if (/^["“«].{12,}["”»]?$/.test(text)) {
      const quoteText = text.replace(/^["“«]|["”»]$/g, '').trim();
      const next = peek(i + 1);
      let attribution: string | undefined;
      let source: string | undefined;
      if (next && /^[-–—]/.test(next) && next.length < 80) {
        attribution = next.replace(/^[-–—]\s*/, '');
        consumed.add(i + 1);
      } else if (next && looksLikeBookReference(next) && (looksLikeBookReference(next)?.confidence ?? 0) >= MEDIUM) {
        source = next;
        consumed.add(i + 1);
      }
      blocks.push({ type: 'quote', text: quoteText, attribution, source });
      consumed.add(i);
      continue;
    }

    // Medium book reference
    if (bookRef && bookRef.confidence >= MEDIUM && text.length < 120) {
      blocks.push({ type: 'reference', text });
      consumed.add(i);
      continue;
    }

    // Low-confidence short heading only if clearly isolated title-case
    if (heading && heading.confidence >= LOW && heading.confidence < MEDIUM && text.length < 60) {
      // Skip — too aggressive; leave as paragraph
    }

    // List items
    const listMatch = /^(\d+[.)]|\u2022|\*|-)\s+(.+)$/.exec(text);
    if (listMatch && !detectHeading(text)) {
      // Collect consecutive list items
      const items = [listMatch[2].trim()];
      const ordered = /^\d+[.)]/.test(text);
      let j = i + 1;
      while (j < lines.length && !consumed.has(j)) {
        const lm = /^(\d+[.)]|\u2022|\*|-)\s+(.+)$/.exec(lines[j].text);
        if (!lm) break;
        items.push(lm[2].trim());
        consumed.add(j);
        j += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      consumed.add(i);
      continue;
    }

    // Default paragraph — split very long runs
    consumed.add(i);
    if (text.length > 420) {
      const sentences = text.split(/(?<=[.!?؟])\s+/).filter(Boolean);
      let chunk = '';
      for (const s of sentences) {
        const next = chunk ? `${chunk} ${s}` : s;
        if (next.split(/\s+/).length > 42 && chunk) {
          blocks.push({ type: 'paragraph', text: chunk.trim() });
          chunk = s;
        } else {
          chunk = next;
        }
      }
      if (chunk.trim()) blocks.push({ type: 'paragraph', text: chunk.trim() });
    } else {
      blocks.push({ type: 'paragraph', text });
    }
  }

  return mergeAdjacentHadithNarration(blocks);
}

/** If a short narration reference sits before a quote, fold into hadith when source follows. */
function mergeAdjacentHadithNarration(blocks: ContentBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (
      b.type === 'reference' &&
      NARRATED_RE.test(b.text) &&
      blocks[i + 1]?.type === 'quote'
    ) {
      const q = blocks[i + 1] as Extract<ContentBlock, { type: 'quote' }>;
      const maybeRef = blocks[i + 2];
      let reference: string | undefined;
      let advance = 2;
      if (maybeRef?.type === 'reference' && isHadithSourceLine(maybeRef.text)) {
        reference = maybeRef.text;
        advance = 3;
      }
      out.push({
        type: 'hadith',
        text: q.text,
        narrator: b.text,
        reference,
      });
      i += advance - 1;
      continue;
    }
    out.push(b);
  }
  return out;
}

/** Serialize blocks to lightweight HTML for admin storage (no schema change). */
export function contentBlocksToHtml(blocks: ContentBlock[]): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const level = Math.min(Math.max(block.level ?? 2, 1), 3);
          const tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
          return `<${tag}>${escape(block.text)}</${tag}>`;
        }
        case 'paragraph':
          return `<p>${escape(block.text)}</p>`;
        case 'arabic':
          return `<p class="content-arabic" dir="rtl" lang="ar">${escape(block.text)}</p>`;
        case 'quran': {
          const parts: string[] = ['<figure class="content-quran">'];
          if (block.arabic) {
            parts.push(`<p class="content-quran-arabic" dir="rtl" lang="ar">${escape(block.arabic)}</p>`);
          }
          if (block.translation) {
            parts.push(`<p class="content-quran-translation">${escape(block.translation)}</p>`);
          }
          if (block.reference) {
            parts.push(`<figcaption class="content-quran-reference">${escape(block.reference)}</figcaption>`);
          }
          parts.push('</figure>');
          return parts.join('');
        }
        case 'hadith': {
          const parts: string[] = ['<blockquote class="content-hadith">'];
          parts.push(`<p>${escape(block.text)}</p>`);
          if (block.narrator) parts.push(`<p class="content-hadith-narrator">${escape(block.narrator)}</p>`);
          if (block.reference) parts.push(`<footer class="content-hadith-source">${escape(block.reference)}</footer>`);
          parts.push('</blockquote>');
          return parts.join('');
        }
        case 'quote': {
          const parts: string[] = ['<blockquote class="content-quote">'];
          parts.push(`<p>${escape(block.text)}</p>`);
          if (block.attribution || block.author) {
            parts.push(`<footer>${escape(block.attribution || block.author || '')}</footer>`);
          }
          if (block.source) parts.push(`<p class="content-source">${escape(block.source)}</p>`);
          parts.push('</blockquote>');
          return parts.join('');
        }
        case 'reference':
          return `<p class="content-reference">${escape(block.text)}</p>`;
        case 'footnote':
          return `<p class="content-footnote" data-footnote="${block.number}"><sup>${block.number}</sup> ${escape(block.text)}</p>`;
        case 'list': {
          const tag = block.ordered ? 'ol' : 'ul';
          const items = block.items.map((it) => `<li>${escape(it)}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;
        }
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

/** Parse stored HTML (from admin / serialized blocks) back into ContentBlocks. */
export function htmlDocumentToContentBlocks(html: string): ContentBlock[] {
  if (typeof document === 'undefined') {
    // SSR / tests without DOM — fall back to plain parser after stripping tags
    return parseBookContent(html.replace(/<[^>]+>/g, '\n'));
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  const blocks: ContentBlock[] = [];

  const walk = (el: HTMLElement) => {
    const tag = el.tagName.toLowerCase();
    const cls = el.className || '';

    if (cls.includes('content-quran') && tag === 'figure') {
      const arabic = el.querySelector('.content-quran-arabic')?.textContent?.trim();
      const translation = el.querySelector('.content-quran-translation')?.textContent?.trim();
      const reference = el.querySelector('.content-quran-reference')?.textContent?.trim();
      blocks.push({ type: 'quran', arabic, translation, reference });
      return;
    }

    if (cls.includes('content-hadith') && tag === 'blockquote') {
      const paras = Array.from(el.querySelectorAll('p'));
      const text = paras.find((p) => !p.className.includes('narrator'))?.textContent?.trim() ?? el.textContent?.trim() ?? '';
      const narrator = el.querySelector('.content-hadith-narrator')?.textContent?.trim();
      const reference = el.querySelector('.content-hadith-source')?.textContent?.trim();
      blocks.push({ type: 'hadith', text, narrator, reference });
      return;
    }

    if (cls.includes('content-arabic')) {
      const text = el.textContent?.trim();
      if (text) blocks.push({ type: 'arabic', text });
      return;
    }

    if (cls.includes('content-reference')) {
      const text = el.textContent?.trim();
      if (text) blocks.push({ type: 'reference', text });
      return;
    }

    if (cls.includes('content-footnote')) {
      const num = Number(el.getAttribute('data-footnote') || el.querySelector('sup')?.textContent || '0');
      const text = (el.textContent || '').replace(/^\s*\d+\s*/, '').trim();
      blocks.push({ type: 'footnote', number: num, text });
      return;
    }

    if (tag === 'blockquote') {
      const text = el.querySelector('p')?.textContent?.trim() || el.textContent?.trim() || '';
      const attribution = el.querySelector('footer')?.textContent?.trim();
      const source = el.querySelector('.content-source')?.textContent?.trim();
      if (text) blocks.push({ type: 'quote', text, attribution, source });
      return;
    }

    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          type: 'heading',
          text,
          level: tag === 'h2' ? 1 : tag === 'h3' ? 2 : 3,
        });
      }
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter(Boolean);
      if (items.length) blocks.push({ type: 'list', ordered: tag === 'ol', items });
      return;
    }

    if (tag === 'p') {
      const text = el.textContent?.trim();
      if (text) blocks.push({ type: 'paragraph', text });
      return;
    }

    // Unknown wrappers — walk children
    Array.from(el.children).forEach((child) => walk(child as HTMLElement));
  };

  Array.from(div.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push(...parseBookContent(text));
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      walk(node as HTMLElement);
    }
  });

  // If HTML was flat / empty structure, re-parse text
  if (blocks.length === 0) {
    return parseBookContent(div.textContent ?? html);
  }

  // Keep structured HTML (headings, quotes, semantic classes) as-is
  const hasRich = blocks.some((b) =>
    ['quran', 'arabic', 'hadith', 'footnote', 'heading', 'quote', 'list', 'reference'].includes(b.type),
  );
  if (hasRich) return blocks;

  // Plain <p>-only HTML: run semantic parser (legacy imports / editor paste)
  const plain = blocks
    .filter((b): b is Extract<ContentBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text)
    .join('\n\n');
  return parseBookContent(plain || (div.textContent ?? html));
}
