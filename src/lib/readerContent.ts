import type { ContentBlock } from '@/types';
import { normalizeDisplayText } from '@/services/content/normalizeText';

const HADITH_HEADER_RE =
  /^(The\s+(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|\d+(?:st|nd|rd|th)?)\s+Hadith)\b[:\s-]*/i;

const INLINE_HADITH_SPLIT =
  /\s+(?=The\s+(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|\d+(?:st|nd|rd|th)?)\s+Hadith\b)/gi;

const NARRATION_RE = /^(It is narrated|Narrated by|On the authority of|According to)/i;

const SECTION_TITLE_RE =
  /^(Chapter|Section|Part|Book|Introduction|Conclusion|Preface)\s+[\dIVXLC]+/i;

const JUNK_PATTERNS = [
  /one\s*path\s*business/i,
  /business\s*solutions/i,
  /developer\s*assignment/i,
  /next\.js/i,
  /supabase\s*client/i,
  /quadrant\s*technologies/i,
  /build\s*the\s*ilm/i,
  /admin\s*panel/i,
  /full[\s-]*stack/i,
  /(?:\b[A-Z]\s+){5,}[A-Z]\b/,
];

const SEMANTIC_TYPES = new Set(['arabic', 'quran', 'hadith', 'footnote']);

function collapseSpacedCaps(text: string): string {
  const spaced = text.match(/(?:\b[A-Z]\s+){4,}[A-Z]\b/);
  if (spaced) return text.replace(spaced[0], '').trim();
  return text;
}

/** Drop PDF cover-page noise and developer-doc fragments. */
export function isJunkReaderText(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return true;
  // Do not reject short legitimate lines (headings, Arabic phrases, sources)
  return JUNK_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** Clean PDF/import spacing artifacts for comfortable reading (single-line safe). */
export function normalizeReaderText(text: string): string {
  return collapseSpacedCaps(
    normalizeDisplayText(text)
      .replace(/\s+/g, ' ')
      .replace(/\bMuslim\s+s\b/gi, 'Muslims')
      .replace(/\s+'/g, "'")
      .replace(/'\s+/g, "'")
      .trim()
  );
}

function splitLongParagraph(text: string): string[] {
  const sentences = text.split(/(?<=[.!?؟])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length <= 2) return [text];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.split(/\s+/).length > 38 && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

function chunkToBlocks(chunk: string): ContentBlock[] {
  const text = normalizeReaderText(chunk);
  if (!text) return [];

  const hadithHeader = HADITH_HEADER_RE.exec(text);
  if (hadithHeader) {
    const blocks: ContentBlock[] = [{ type: 'heading', text: hadithHeader[1], level: 1 }];
    const rest = text.slice(hadithHeader[0].length).trim();
    if (rest) blocks.push(...chunkToBlocks(rest));
    return blocks;
  }

  if (SECTION_TITLE_RE.test(text) && text.length < 90) {
    return [{ type: 'heading', text, level: 2 }];
  }

  const quoteMatch = text.match(/"([^"]{12,})"/);
  if (quoteMatch && quoteMatch.index !== undefined) {
    const blocks: ContentBlock[] = [];
    const before = text.slice(0, quoteMatch.index).trim();
    const after = text.slice(quoteMatch.index + quoteMatch[0].length).trim();

    if (before) {
      if (NARRATION_RE.test(before)) {
        blocks.push({ type: 'reference', text: before });
      } else {
        blocks.push(...chunkToBlocks(before));
      }
    }

    blocks.push({ type: 'quote', text: quoteMatch[1].trim() });

    if (after) {
      if (after.length > 280) {
        splitLongParagraph(after).forEach((p) => blocks.push({ type: 'paragraph', text: p }));
      } else {
        blocks.push({ type: 'paragraph', text: after });
      }
    }

    return blocks;
  }

  if (NARRATION_RE.test(text)) {
    return [{ type: 'reference', text }];
  }

  if (text.length > 320) {
    return splitLongParagraph(text)
      .map((p) => ({ type: 'paragraph' as const, text: p }))
      .filter((p) => !isJunkReaderText(p.text));
  }

  if (isJunkReaderText(text)) return [];
  return [{ type: 'paragraph', text }];
}

function expandParagraphBlock(text: string): ContentBlock[] {
  const normalized = normalizeReaderText(text);
  if (!normalized) return [];

  const pieces = normalized
    .replace(INLINE_HADITH_SPLIT, '\n\n')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (pieces.length <= 1 && normalized.length > 280) {
    return chunkToBlocks(normalized);
  }

  return pieces.flatMap((piece) => chunkToBlocks(piece));
}

/**
 * Light post-pass for reader polish. Preserves semantic blocks from the
 * content parser (arabic / quran / hadith / footnote).
 */
export function enrichContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const expanded: ContentBlock[] = [];

  for (const block of blocks) {
    if (SEMANTIC_TYPES.has(block.type)) {
      if (block.type === 'arabic') {
        const text = normalizeDisplayText(block.text);
        if (text) expanded.push({ ...block, text });
        continue;
      }
      if (block.type === 'quran') {
        expanded.push({
          ...block,
          arabic: block.arabic ? normalizeDisplayText(block.arabic) : block.arabic,
          translation: block.translation ? normalizeReaderText(block.translation) : block.translation,
          reference: block.reference ? normalizeDisplayText(block.reference) : block.reference,
        });
        continue;
      }
      if (block.type === 'hadith') {
        const text = normalizeReaderText(block.text);
        if (!isJunkReaderText(text)) {
          expanded.push({
            ...block,
            text,
            narrator: block.narrator ? normalizeReaderText(block.narrator) : block.narrator,
            reference: block.reference ? normalizeDisplayText(block.reference) : block.reference,
          });
        }
        continue;
      }
      if (block.type === 'footnote') {
        const text = normalizeReaderText(block.text);
        if (text) expanded.push({ ...block, text });
        continue;
      }
    }

    if (block.type === 'paragraph' && block.text.length > 120) {
      expanded.push(...expandParagraphBlock(block.text));
      continue;
    }

    if (block.type === 'paragraph') {
      const text = normalizeReaderText(block.text);
      if (!isJunkReaderText(text)) {
        expanded.push({ type: 'paragraph', text });
      }
      continue;
    }

    if (block.type === 'heading') {
      const text = normalizeReaderText(block.text);
      if (!isJunkReaderText(text)) {
        expanded.push({ ...block, text });
      }
      continue;
    }

    if (block.type === 'quote') {
      const text = normalizeReaderText(block.text);
      if (!isJunkReaderText(text)) {
        expanded.push({
          ...block,
          text,
          attribution: block.attribution ? normalizeReaderText(block.attribution) : block.attribution,
          author: block.author ? normalizeReaderText(block.author) : block.author,
          source: block.source ? normalizeDisplayText(block.source) : block.source,
        });
      }
      continue;
    }

    if (block.type === 'reference') {
      const text = normalizeDisplayText(block.text);
      if (text) expanded.push({ ...block, text });
      continue;
    }

    expanded.push(block);
  }

  return expanded.filter((block) => {
    if (block.type === 'quran') {
      return Boolean(block.arabic || block.translation || block.reference);
    }
    if (block.type === 'list') return block.items.length > 0;
    if ('text' in block && typeof block.text === 'string') {
      return block.type === 'arabic' ? block.text.trim().length > 0 : !isJunkReaderText(block.text);
    }
    return true;
  });
}
