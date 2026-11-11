import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { splitBilingualColumns } from '@/lib/readerPages';
import type { ContentBlock } from '@/types';

interface PageContentViewProps {
  blocks: ContentBlock[];
  fontSize: number;
  lineHeight: number;
  highlightQuery?: string;
  /** Prefer side-by-side EN | AR when both scripts exist on the page */
  preferParallel?: boolean;
}

/**
 * Renders one reading page. When English + Arabic both exist, uses a
 * kutub-style two-column parallel layout on md+ screens.
 */
export function PageContentView({
  blocks,
  fontSize,
  lineHeight,
  highlightQuery,
  preferParallel = true,
}: PageContentViewProps) {
  const { mode, ltr, rtl } = splitBilingualColumns(blocks);

  if (!preferParallel || mode !== 'parallel') {
    return (
      <ContentRenderer
        blocks={blocks}
        fontSize={fontSize}
        lineHeight={lineHeight}
        highlightQuery={highlightQuery}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-0">
      <div className="min-w-0 md:pr-6 md:border-r md:border-black/[0.06] dark:md:border-white/10">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider reader-muted">
          English
        </p>
        {ltr.length > 0 ? (
          <ContentRenderer
            blocks={ltr}
            fontSize={fontSize}
            lineHeight={lineHeight}
            highlightQuery={highlightQuery}
          />
        ) : (
          <p className="text-[13px] reader-muted">No English text on this page.</p>
        )}
      </div>
      <div className="min-w-0 md:pl-6">
        <p className="mb-3 text-right text-[10px] font-semibold uppercase tracking-wider reader-muted">
          العربية
        </p>
        {rtl.length > 0 ? (
          <ContentRenderer
            blocks={rtl}
            fontSize={fontSize}
            lineHeight={lineHeight}
            highlightQuery={highlightQuery}
          />
        ) : (
          <p className="text-right text-[13px] reader-muted">لا نص عربي في هذه الصفحة.</p>
        )}
      </div>
    </div>
  );
}
