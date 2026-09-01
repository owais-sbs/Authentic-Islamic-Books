import type { ContentBlock } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize: number;
  lineHeight: number;
  highlightQuery?: string;
}

const NARRATION_RE = /^(It is narrated|Narrated by|On the authority of|According to)/i;

function highlightText(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lowerText.indexOf(lowerQ);
  if (idx === -1) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let searchIdx = idx;

  while (searchIdx !== -1) {
    if (searchIdx > lastIndex) {
      parts.push(text.slice(lastIndex, searchIdx));
    }
    parts.push(
      <mark key={searchIdx} className="bg-accent/25 text-inherit rounded px-0.5">
        {text.slice(searchIdx, searchIdx + q.length)}
      </mark>
    );
    lastIndex = searchIdx + q.length;
    searchIdx = lowerText.indexOf(lowerQ, lastIndex);
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

export function ContentRenderer({ blocks, fontSize, lineHeight, highlightQuery }: ContentRendererProps) {
  const enriched = enrichContentBlocks(blocks);
  const firstParagraphIndex = enriched.findIndex((b) => b.type === 'paragraph');

  return (
    <div
      className="reader-prose"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      {enriched.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={i}
                className={cn(
                  'reader-muted',
                  i === firstParagraphIndex && 'reader-lead',
                  NARRATION_RE.test(block.text) && 'reader-narration'
                )}
              >
                {highlightText(block.text, highlightQuery)}
              </p>
            );

          case 'heading': {
            const isHadith = /hadith/i.test(block.text);
            const HeadingTag = (block.level && block.level <= 3 ? `h${block.level + 2}` : 'h3') as 'h3' | 'h4' | 'h5';
            return (
              <HeadingTag
                key={i}
                className={cn('reader-heading', isHadith && 'reader-hadith-heading')}
                style={{ fontSize: block.level && block.level <= 2 ? `${fontSize + 4}px` : `${fontSize + 2}px` }}
              >
                {block.text}
              </HeadingTag>
            );
          }

          case 'quote':
            return (
              <blockquote
                key={i}
                className="reader-hadith-quote my-6 border-l-[3px] reader-accent pl-5"
                style={{ fontSize: `${fontSize + 1}px` }}
              >
                <p className="reader-muted leading-relaxed">
                  &ldquo;{highlightText(block.text, highlightQuery)}&rdquo;
                </p>
                {block.attribution && (
                  <footer className="mt-3 text-sm reader-muted not-italic">— {block.attribution}</footer>
                )}
              </blockquote>
            );

          case 'list':
            return block.ordered ? (
              <ol key={i} className="my-4 ml-5 list-decimal space-y-1.5 reader-muted">
                {block.items.map((item, j) => (
                  <li key={j}>{highlightText(item, highlightQuery)}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="my-4 ml-5 list-disc space-y-1.5 reader-muted">
                {block.items.map((item, j) => (
                  <li key={j}>{highlightText(item, highlightQuery)}</li>
                ))}
              </ul>
            );

          case 'footnote':
            return (
              <div key={i} className="my-3 text-sm reader-muted" style={{ fontSize: `${Math.max(fontSize - 3, 13)}px` }}>
                <sup className="reader-accent font-medium">{block.number}</sup>{' '}
                {highlightText(block.text, highlightQuery)}
              </div>
            );

          case 'reference':
            return (
              <div
                key={i}
                className="reader-narration my-4 rounded-lg border border-accent/15 bg-accent/5 px-4 py-3 text-[0.95em] reader-muted"
                style={{ fontSize: `${Math.max(fontSize - 1, 14)}px` }}
              >
                {highlightText(block.text, highlightQuery)}
                {block.source && <div className="mt-1 not-italic reader-accent">{block.source}</div>}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
