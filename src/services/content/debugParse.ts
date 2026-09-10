/**
 * Developer helper to inspect parser output.
 * Usage (browser console / scripts):
 *   import { debugParseBookContent } from '@/services/content/debugParse';
 *   console.log(debugParseBookContent(rawText));
 *
 * Not wired into production reader UI.
 */
import { parseBookContent } from './parseBookContent';
import type { ContentBlock } from '@/types';

export function debugParseBookContent(raw: string): ContentBlock[] {
  const blocks = parseBookContent(raw);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[content-parser]', blocks);
  }
  return blocks;
}
