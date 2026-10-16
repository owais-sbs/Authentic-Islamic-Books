import type { ContentBlock } from '@/types';
import { normalizeDisplayText } from '@/services/content/normalizeText';
import { languageMeta } from '@/services/pdf/language';

const HADITH_HEADER_RE =
  /^(The\s+(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|\d+(?:st|nd|rd|th)?)\s+Hadith)\b[:\s-]*/i;

const INLINE_HADITH_SPLIT =
  /\s+(?=The\s+(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|\d+(?:st|nd|rd|th)?)\s+Hadith\b)/gi;

const NARRATION_RE = /^(It is narrated|Narrated by|On the authority of|According to)/i;

const SECTION_TITLE_RE = /^(Chapter|Section|Part|Book|CHAPTER|SECTION|PART)\s+(\d+|[IVXLC]+)\b/;

/** "…said:" / "narrated:" style lead-in that introduces a quotation. */
const QUOTE_LEAD_IN = /(said|says|stated|narrated|reported|wrote|asked|replied)[^.!?]{0,40}[:,]?$/i;

const SEMANTIC_TYPES = new Set(['arabic', 'quran', 'hadith', 'footnote']);

function collapseSpacedCaps(text: string): string {
  const spaced = text.match(/(?:\b[A-Z]\s+){4,}[A-Z]\b/);
  if (spaced) return text.replace(spaced[0], '').trim();
  return text;
}

/** Empty / whitespace-only text. Real book text is never dropped. */
export function isJunkReaderText(text: string): boolean {
  return !text.trim();
}

/** Clean PDF/import spacing artifacts for comfortable reading (single-line safe). */
export function normalizeReaderText(text: string): string {
  return collapseSpacedCaps(
    normalizeDisplayText(text)
      .replace(/\s+/g, ' ')
      .replace(/\bMuslim\s+s\b/gi, 'Muslims')
      .trim()
  );
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

  // Pull out a quotation only when it is introduced ("…said:") and substantial —
  // never from the middle of an ordinary sentence.
  const quoteMatch = text.match(/["“]([^"”]{40,})["”]/);
  const leadIn = quoteMatch?.index !== undefined ? text.slice(0, quoteMatch.index).trim() : '';
  if (quoteMatch && quoteMatch.index !== undefined && (!leadIn || QUOTE_LEAD_IN.test(leadIn))) {
    const blocks: ContentBlock[] = [];
    const before = leadIn;
    const after = text.slice(quoteMatch.index + quoteMatch[0].length).trim();

    if (before) {
      if (NARRATION_RE.test(before)) {
        blocks.push({ type: 'reference', text: before });
      } else {
        blocks.push(...chunkToBlocks(before));
      }
    }

    blocks.push({ type: 'quote', text: quoteMatch[1].trim() });

    if (after) blocks.push({ type: 'paragraph', text: after });

    return blocks;
  }

  if (NARRATION_RE.test(text)) {
    return [{ type: 'reference', text }];
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
 * Direction/language are not kept in stored HTML, so derive them from the text:
 * Arabic / Urdu paragraphs, headings and quotes render right-to-left.
 */
function withDirection(block: ContentBlock): ContentBlock {
  if (block.direction && block.type !== 'arabic') return block;
  const text =
    'text' in block && typeof block.text === 'string'
      ? block.text
      : block.type === 'list'
        ? block.items.join(' ')
        : '';
  if (!text) return block;
  const meta = languageMeta(text);
  if (block.type === 'arabic') {
    // Urdu was historically stored as Arabic — keep the real language
    const language = meta.language === 'ur' ? 'ur' : block.language ?? 'ar';
    return { ...block, language, direction: 'rtl' };
  }
  if (meta.direction !== 'rtl') return block;
  return { ...block, language: block.language ?? meta.language, direction: 'rtl' };
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

  return expanded.map(withDirection).filter((block) => {
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
