import type { ContentBlock } from '@/types';

const LIST_ITEM = /^(\d+[.)]|\u2022|\*|-)\s+(.+)$/;

/** Convert cleaned section text into rich reader blocks (paragraphs, quotes, lists). */
export function textToContentBlocks(text: string): ContentBlock[] {
  if (!text.trim()) return [];

  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const blocks: ContentBlock[] = [];
  let paragraph = '';
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    const p = paragraph.trim();
    if (!p) return;
    const sentences = p.split(/(?<=[.!?؟])\s+/).filter((s) => s.length > 8);
    let chunk = '';
    for (const sentence of sentences) {
      chunk += (chunk ? ' ' : '') + sentence;
      if (chunk.split(/\s+/).length >= 45) {
        blocks.push({ type: 'paragraph', text: chunk.trim() });
        chunk = '';
      }
    }
    if (chunk.trim()) blocks.push({ type: 'paragraph', text: chunk.trim() });
    paragraph = '';
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: 'list', ordered: listOrdered, items: [...listItems] });
    listItems = [];
    listOrdered = false;
  };

  for (const line of lines) {
    const listMatch = LIST_ITEM.exec(line);
    if (listMatch) {
      flushParagraph();
      listOrdered = /^\d+[.)]/.test(line);
      listItems.push(listMatch[2].trim());
      continue;
    }

    if (/^["“«].+["”»]?$/.test(line) || (line.startsWith('"') && line.length > 20)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', text: line.replace(/^["“«]|["”»]$/g, '') });
      continue;
    }

    flushList();
    paragraph += (paragraph ? ' ' : '') + line;
  }

  flushList();
  flushParagraph();

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', text: text.trim() }];
}
