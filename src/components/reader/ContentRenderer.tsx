import type { ContentBlock } from '@/types';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize: number;
  lineHeight: number;
  highlightQuery?: string;
}

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
  return (
    <div
      className="reader-prose"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="reader-muted">
                {highlightText(block.text, highlightQuery)}
              </p>
            );

          case 'heading': {
            const HeadingTag = (block.level && block.level <= 3 ? `h${block.level + 2}` : 'h3') as 'h3' | 'h4' | 'h5';
            return (
              <HeadingTag
                key={i}
                className="mt-8 mb-3 first:mt-0"
                style={{ fontSize: block.level && block.level <= 2 ? `${fontSize + 3}px` : `${fontSize + 1}px` }}
              >
                {block.text}
              </HeadingTag>
            );
          }

          case 'quote':
            return (
              <blockquote
                key={i}
                className="my-6 border-l-2 reader-accent pl-5 italic"
                style={{ fontSize: `${fontSize}px` }}
              >
                <p className="reader-muted">“{block.text}”</p>
                {block.attribution && (
                  <footer className="mt-2 text-sm reader-muted not-italic">— {block.attribution}</footer>
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
                className={cn(
                  'my-4 border-l-2 pl-4 text-sm reader-muted italic'
                )}
                style={{ fontSize: `${Math.max(fontSize - 3, 13)}px` }}
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
