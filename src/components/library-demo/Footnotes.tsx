import type { FootnoteItem } from '@/data/libraryDemo';

interface FootnotesProps {
  items: FootnoteItem[];
  title?: string;
}

export function Footnotes({ items, title = 'Footnotes' }: FootnotesProps) {
  if (!items.length) return null;

  return (
    <div className="mt-10 border-t border-line pt-6">
      <h4 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
        {title}
      </h4>
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={item.number} className="flex gap-3 font-serif text-[13px] leading-relaxed text-ink-600">
            <span className="shrink-0 font-sans text-[12px] font-semibold text-accent-dark">
              {item.number}.
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
