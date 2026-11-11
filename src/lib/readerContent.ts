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

const SEMANTIC_TYPES = new Set([
  'arabic',
  'urdu',
  'bilingual',
  'quran',
  'hadith',
  'footnote',
  'endnote',
  'citation',
  'image',
  'table',
  'audio',
  'pdf',
  'callout',
  'html',
]);

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
      if (block.type === 'arabic' || block.type === 'urdu') {
        const text = normalizeDisplayText(block.text);
        if (text) expanded.push({ ...block, text });
        continue;
      }
      if (block.type === 'bilingual') {
        expanded.push({
          ...block,
          arabic: block.arabic ? normalizeDisplayText(block.arabic) : block.arabic,
          translation: block.translation
            ? normalizeReaderText(block.translation)
            : block.translation,
        });
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
        if (!isJunkReaderText(text) || block.arabic) {
          expanded.push({
            ...block,
            text: text || block.arabic || '',
            arabic: block.arabic ? normalizeDisplayText(block.arabic) : block.arabic,
            narrator: block.narrator ? normalizeReaderText(block.narrator) : block.narrator,
            reference: block.reference ? normalizeDisplayText(block.reference) : block.reference,
          });
        }
        continue;
      }
      if (block.type === 'footnote' || block.type === 'endnote' || block.type === 'citation') {
        const text = normalizeReaderText(block.text);
        if (text) expanded.push({ ...block, text });
        continue;
      }
      if (block.type === 'callout') {
        const text = normalizeReaderText(block.text);
        if (text || block.claim || block.response) expanded.push({ ...block, text });
        continue;
      }
      if (block.type === 'image') {
        if (block.url?.trim() || block.storagePath?.trim()) expanded.push(block);
        continue;
      }
      if (block.type === 'table' || block.type === 'audio' || block.type === 'pdf' || block.type === 'html') {
        expanded.push(block);
        continue;
      }
    }

    // Only aggressively re-chunk very long blobs — short paras keep natural spacing
    if (block.type === 'paragraph' && block.text.length > 520) {
      const expandedParas = expandParagraphBlock(block.text).map((b) => {
        if (b.type !== 'paragraph') return b;
        const meta = languageMeta(b.text);
        if (meta.language === 'ar' || meta.language === 'ur') {
          return {
            type: meta.language === 'ur' ? ('urdu' as const) : ('arabic' as const),
            text: b.text,
            language: meta.language,
            direction: 'rtl' as const,
          };
        }
        return {
          ...b,
          language: block.language ?? b.language,
          direction: block.direction ?? b.direction,
        };
      });
      expanded.push(...expandedParas);
      continue;
    }

    if (block.type === 'paragraph') {
      const text = normalizeReaderText(block.text);
      if (isJunkReaderText(text)) continue;
      const meta = languageMeta(text);
      const lang = block.language ?? meta.language;
      const dir = block.direction ?? meta.direction;
      if (lang === 'ar' || lang === 'ur' || dir === 'rtl') {
        expanded.push({
          type: lang === 'ur' ? 'urdu' : 'arabic',
          text,
          language: lang === 'ur' ? 'ur' : 'ar',
          direction: 'rtl',
        });
      } else {
        expanded.push({
          type: 'paragraph',
          text,
          language: block.language,
          direction: block.direction,
        });
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

  const directed = expanded.map(withDirection).filter((block) => {
    if (block.type === 'quran') {
      return Boolean(block.arabic || block.translation || block.reference);
    }
    if (block.type === 'list') return block.items.length > 0;
    if ('text' in block && typeof block.text === 'string') {
      return block.type === 'arabic' ? block.text.trim().length > 0 : !isJunkReaderText(block.text);
    }
    return true;
  });

  // Merge broken PDF line-paragraphs so Nawawi-style pages are not full of huge gaps
  return compactBrokenParagraphs(directed);
}

function isContinuableParagraph(block: ContentBlock): block is Extract<ContentBlock, { type: 'paragraph' }> {
  return block.type === 'paragraph' && Boolean(block.text?.trim());
}

/** Join consecutive short English paragraphs that are clearly mid-sentence splits. */
function compactBrokenParagraphs(blocks: ContentBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (const block of blocks) {
    const prev = out[out.length - 1];
    if (
      isContinuableParagraph(block) &&
      prev &&
      isContinuableParagraph(prev) &&
      (prev.language ?? 'en') === (block.language ?? 'en') &&
      (prev.direction ?? 'ltr') === (block.direction ?? 'ltr') &&
      prev.language !== 'ar' &&
      prev.language !== 'ur' &&
      block.language !== 'ar' &&
      block.language !== 'ur'
    ) {
      const prevEndsOpen = /[,;:–—\-]$/.test(prev.text.trim()) || !/[.!?…”"]$/.test(prev.text.trim());
      const nextContinues =
        /^[a-z(]/.test(block.text.trim()) ||
        (prevEndsOpen && block.text.trim().length < 220);
      const bothShort = prev.text.length < 280 && block.text.length < 280;
      if (prevEndsOpen && nextContinues && bothShort) {
        out[out.length - 1] = {
          ...prev,
          text: `${prev.text.trim()} ${block.text.trim()}`.replace(/\s+/g, ' '),
        };
        continue;
      }
    }
    out.push(block);
  }
  return out;
}
