import type { ContentBlock } from '@/types';
import { parseBookContent } from '@/services/content/parseBookContent';
import { enrichContentBlocks } from '@/lib/readerContent';
import { languageMeta, type BookLanguage } from './language';

function withLang(block: ContentBlock): ContentBlock {
  if (block.language && block.direction) return block;

  if (block.type === 'arabic') {
    return {
      ...block,
      language: block.language ?? 'ar',
      direction: block.direction ?? 'rtl',
    };
  }

  if (block.type === 'quran') {
    return {
      ...block,
      language: block.language ?? 'ar',
      direction: block.direction ?? 'rtl',
    };
  }

  if (block.type === 'list') {
    const sample = block.items.join(' ');
    const meta = languageMeta(sample);
    return { ...block, language: block.language ?? meta.language, direction: block.direction ?? meta.direction };
  }

  const text =
    'text' in block && typeof block.text === 'string'
      ? block.text
      : 'translation' in block && typeof (block as { translation?: string }).translation === 'string'
        ? (block as { translation: string }).translation
        : '';

  if (!text) return block;
  const meta = languageMeta(text);
  return {
    ...block,
    language: (block.language ?? meta.language) as BookLanguage,
    direction: block.direction ?? meta.direction,
  };
}

/**
 * Convert cleaned section text into rich reader blocks.
 * Preserves natural paragraphs — no artificial ~45-word splitting.
 * Attaches optional language/direction metadata.
 */
export function textToContentBlocks(text: string): ContentBlock[] {
  if (!text.trim()) return [];
  const parsed = parseBookContent(text);
  const enriched = enrichContentBlocks(parsed);
  return enriched.map(withLang);
}
