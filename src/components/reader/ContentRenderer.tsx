import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { ContentBlock, BookContentDirection, BookContentLanguage } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';
import { AttachmentBlock } from '@/components/reader/AttachmentBlock';
import { getAttachmentSignedUrl } from '@/lib/bookApi';
import { cn } from '@/lib/utils';

function ResolvedImage({
  url,
  storagePath,
  bucket,
  alt,
  className,
}: {
  url?: string;
  storagePath?: string;
  bucket?: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState(url || '');
  useEffect(() => {
    if (url) {
      setSrc(url);
      return;
    }
    if (!storagePath) return;
    let cancelled = false;
    void getAttachmentSignedUrl(
      (bucket as 'book-images' | 'book-pdfs' | 'book-attachments') || 'book-images',
      storagePath,
    )
      .then((signed) => {
        if (!cancelled) setSrc(signed);
      })
      .catch(() => {
        /* leave empty — onError softens */
      });
    return () => {
      cancelled = true;
    };
  }, [url, storagePath, bucket]);

  if (!src) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-black/[0.04] text-[12px] reader-muted">
        Loading image…
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.opacity = '0.35';
      }}
    />
  );
}

interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize: number;
  lineHeight: number;
  highlightQuery?: string;
}

const NARRATION_RE = /^(It is narrated|Narrated by|On the authority of|According to)/i;

function highlightText(text: string, query?: string): ReactNode {
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
      </mark>,
    );
    lastIndex = searchIdx + q.length;
    searchIdx = lowerText.indexOf(lowerQ, lastIndex);
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

function formatQuranCaption(reference?: string): string {
  if (!reference) return '';
  const cleaned = reference
    .replace(/^\[|\]$/g, '')
    .replace(/\bA\s+l-/i, 'Al-')
    .replace(/\s+/g, ' ')
    .trim();
  // Prefer clean bracket style: [Al-Nahl: aya 97]
  const aya = cleaned.match(/^(.+?)\s+(\d{1,3})(?:\s*[-–—:]\s*(\d{1,3}))?$/i);
  if (aya && !/^Qur/i.test(aya[1])) {
    const surah = aya[1].replace(/^Qur['’]?an\s*[—–-]?\s*/i, '').trim();
    return `[${surah}: aya ${aya[2]}]`;
  }
  if (/^Qur['’]?an/i.test(cleaned)) return cleaned;
  return `[${cleaned}]`;
}

/** Skip drop-cap / lead styling on short citations and bracket refs. */
function looksLikeCitationLine(text: string): boolean {
  const t = text.trim();
  if (t.length < 80 && /^\[/.test(t)) return true;
  if (/^(?:Qur['’]?an|Surah|Soorah)\b/i.test(t) && t.length < 80) return true;
  if (/\baya[h]?\s+\d+/i.test(t) && t.length < 80) return true;
  return false;
}

/** Discard clear OCR/font garbage — never hide readable Arabic ayahs. */
function isGarbledMixedLine(text: string): boolean {
  const t = text.trim();
  if (t.length < 6) return false;

  const arabic = (t.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const symbols = (t.match(/[%€&<>$#@^*_=+|\\]/g) || []).length;
  const words = t.split(/\s+/).filter(Boolean);

  // Substantial Arabic (ayah / quotation) — always keep, even with a few Latin OCR nicks
  if (arabic >= 10 && arabic >= latin) return false;
  if (arabic >= 18) return false;

  // Clear mixed corruption with symbols ("Zong 5% € سس")
  if (symbols >= 2 && arabic > 0 && latin > 0 && arabic < 12) return true;

  if (arabic > 0 && latin > 0 && arabic < 10) {
    const shortJunk = words.filter((w) => /^[A-Za-z]{1,3}$/.test(w) || w.length <= 2).length;
    if (shortJunk / Math.max(words.length, 1) > 0.45) return true;
  }

  // Fragmented Arabic is repaired at import — do not hide remaining short tokens
  return false;
}

function resolveDir(
  language?: BookContentLanguage,
  direction?: BookContentDirection,
  fallback: BookContentDirection = 'ltr',
): BookContentDirection {
  if (direction) return direction;
  if (language === 'ar' || language === 'ur') return 'rtl';
  return fallback;
}

function langAttr(language?: BookContentLanguage): string | undefined {
  if (language === 'ar') return 'ar';
  if (language === 'ur') return 'ur';
  if (language === 'en') return 'en';
  return undefined;
}

function blockClass(language?: BookContentLanguage, direction?: BookContentDirection): string {
  const dir = resolveDir(language, direction);
  return cn(
    dir === 'rtl' && 'reader-rtl-block',
    language === 'ar' && 'reader-lang-ar',
    language === 'ur' && 'reader-lang-ur',
    language === 'en' && 'reader-lang-en',
  );
}

function blockStyle(
  language?: BookContentLanguage,
  direction?: BookContentDirection,
  extra?: CSSProperties,
): CSSProperties {
  const dir = resolveDir(language, direction);
  return {
    direction: dir,
    textAlign: dir === 'rtl' ? 'right' : 'left',
    unicodeBidi: 'isolate',
    ...extra,
  };
}

export function ContentRenderer({ blocks, fontSize, lineHeight, highlightQuery }: ContentRendererProps) {
  const enriched = useMemo(() => enrichContentBlocks(blocks), [blocks]);
  const firstParagraphIndex = enriched.findIndex((b) => b.type === 'paragraph');
  const small = Math.max(fontSize - 2, 13);
  const arabicSize = Math.max(fontSize + 6, 22);

  return (
    <div
      className="reader-prose"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      {enriched.map((block, i) => {
        switch (block.type) {
          case 'paragraph': {
            if (isGarbledMixedLine(block.text)) return null;
            const dir = resolveDir(block.language, block.direction);
            const isRtlScript = block.language === 'ar' || block.language === 'ur';
            const citation = looksLikeCitationLine(block.text);
            const useLead =
              i === firstParagraphIndex &&
              !citation &&
              !isRtlScript &&
              block.text.trim().length > 40;
            return (
              <p
                key={i}
                className={cn(
                  'reader-muted',
                  useLead && 'reader-lead',
                  citation && 'reader-reference-line',
                  NARRATION_RE.test(block.text) && 'reader-narration',
                  blockClass(block.language, block.direction),
                  isRtlScript && (block.language === 'ur' ? 'reader-urdu' : 'reader-arabic'),
                )}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(
                  block.language,
                  block.direction,
                  isRtlScript
                    ? { fontSize: `${arabicSize}px`, lineHeight: 2.1 }
                    : undefined,
                )}
              >
                {highlightText(block.text, highlightQuery)}
              </p>
            );
          }

          case 'heading': {
            const isHadith = /hadith/i.test(block.text);
            const level = block.level ?? 2;
            const HeadingTag = (level <= 1 ? 'h2' : level === 2 ? 'h3' : 'h4') as 'h2' | 'h3' | 'h4';
            const sizeBoost = level <= 1 ? 8 : level === 2 ? 4 : 2;
            const dir = resolveDir(block.language, block.direction);
            // Respect explicit alignment set in the editor; fall back to default block direction
            const explicitAlign = block.align;
            return (
              <HeadingTag
                key={i}
                className={cn(
                  'reader-heading',
                  level <= 1 && 'reader-heading-chapter',
                  level === 2 && 'reader-heading-section',
                  isHadith && 'reader-hadith-heading',
                  blockClass(block.language, block.direction),
                )}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(block.language, block.direction, {
                  fontSize: `${fontSize + sizeBoost}px`,
                  ...(explicitAlign ? { textAlign: explicitAlign } : {}),
                })}
              >
                {block.text}
              </HeadingTag>
            );
          }

          case 'arabic':
            if (isGarbledMixedLine(block.text)) return null;
            return (
              <p
                key={i}
                className={cn(
                  'reader-arabic',
                  blockClass(block.language ?? 'ar', block.direction ?? 'rtl'),
                )}
                dir="rtl"
                lang={block.language === 'ur' ? 'ur' : 'ar'}
                style={{ fontSize: `${arabicSize}px`, lineHeight: 2.35 }}
              >
                {highlightText(block.text, highlightQuery)}
              </p>
            );

          case 'quran':
            if (block.arabic && isGarbledMixedLine(block.arabic) && !block.translation && !block.reference) {
              return null;
            }
            return (
              <figure key={i} className="reader-quran">
                {block.arabic && (
                  <p
                    className="reader-quran-arabic"
                    dir="rtl"
                    lang="ar"
                    style={{ fontSize: `${arabicSize + 6}px`, lineHeight: 2.45 }}
                  >
                    {highlightText(block.arabic, highlightQuery)}
                  </p>
                )}
                {block.translation && (
                  <p
                    className="reader-quran-translation reader-muted"
                    dir="ltr"
                    lang="en"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    &ldquo;{highlightText(block.translation, highlightQuery)}&rdquo;
                  </p>
                )}
                {block.reference && (
                  <figcaption className="reader-quran-reference" style={{ fontSize: `${small}px` }}>
                    {formatQuranCaption(block.reference)}
                  </figcaption>
                )}
              </figure>
            );

          case 'hadith': {
            const dir = resolveDir(block.language, block.direction);
            return (
              <blockquote
                key={i}
                className={cn('reader-hadith-block', blockClass(block.language, block.direction))}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(block.language, block.direction)}
              >
                {block.text && (
                  <p className="reader-muted leading-relaxed" style={{ fontSize: `${fontSize + 1}px` }}>
                    &ldquo;{highlightText(block.text, highlightQuery)}&rdquo;
                  </p>
                )}
                {block.arabic && (
                  <p
                    className="reader-arabic mt-2"
                    dir="rtl"
                    lang="ar"
                    style={{ fontSize: `${arabicSize}px`, lineHeight: 2.35 }}
                  >
                    {highlightText(block.arabic, highlightQuery)}
                  </p>
                )}
                {block.narrator && (
                  <p className="reader-hadith-narrator" style={{ fontSize: `${small}px` }}>
                    {highlightText(block.narrator, highlightQuery)}
                  </p>
                )}
                {block.reference && (
                  <footer className="reader-hadith-source" style={{ fontSize: `${small}px` }}>
                    {highlightText(block.reference, highlightQuery)}
                  </footer>
                )}
              </blockquote>
            );
          }

          case 'quote': {
            const dir = resolveDir(block.language, block.direction);
            const quoteLines = block.text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
            return (
              <blockquote
                key={i}
                className={cn(
                  'reader-scholar-quote my-6 border-l-[3px] reader-accent pl-5',
                  blockClass(block.language, block.direction),
                  dir === 'rtl' && 'border-l-0 border-r-[3px] pl-0 pr-5',
                )}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(block.language, block.direction, { fontSize: `${fontSize + 1}px` })}
              >
                {quoteLines.length <= 1 ? (
                  <p className="reader-muted leading-relaxed whitespace-pre-line">
                    &ldquo;{highlightText(block.text, highlightQuery)}&rdquo;
                  </p>
                ) : (
                  quoteLines.map((line, li) => (
                    <p
                      key={li}
                      className={cn('reader-muted leading-relaxed', li > 0 && 'mt-2')}
                    >
                      {li === 0 ? (
                        <>&ldquo;{highlightText(line, highlightQuery)}</>
                      ) : li === quoteLines.length - 1 ? (
                        <>{highlightText(line, highlightQuery)}&rdquo;</>
                      ) : (
                        highlightText(line, highlightQuery)
                      )}
                    </p>
                  ))
                )}
                {(block.attribution || block.author) && (
                  <footer className="mt-3 text-sm reader-muted not-italic">
                    — {block.attribution || block.author}
                  </footer>
                )}
                {block.source && (
                  <p className="reader-source-line mt-2 not-italic" style={{ fontSize: `${small}px` }}>
                    {highlightText(block.source, highlightQuery)}
                  </p>
                )}
              </blockquote>
            );
          }

          case 'list': {
            const dir = resolveDir(block.language, block.direction);
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={i}
                className={cn(
                  'my-4 space-y-1.5 reader-muted',
                  dir === 'rtl' ? 'mr-5 list-inside' : 'ml-5',
                  block.ordered ? 'list-decimal' : 'list-disc',
                  blockClass(block.language, block.direction),
                )}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(block.language, block.direction)}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{highlightText(item, highlightQuery)}</li>
                ))}
              </ListTag>
            );
          }

          case 'footnote': {
            const dir = resolveDir(block.language, block.direction);
            return (
              <aside
                key={i}
                className={cn('reader-footnote my-3', blockClass(block.language, block.direction))}
                dir={dir}
                lang={langAttr(block.language)}
                style={blockStyle(block.language, block.direction, {
                  fontSize: `${Math.max(fontSize - 3, 12)}px`,
                })}
              >
                <sup className="reader-accent font-medium">[{block.number}]</sup>{' '}
                <span className="reader-muted">{highlightText(block.text, highlightQuery)}</span>
              </aside>
            );
          }

          case 'reference': {
            const caption =
              block.source === 'quran' || /aya|surah|qur/i.test(block.text)
                ? formatQuranCaption(block.text)
                : block.text;
            return (
              <p
                key={i}
                className="reader-quran-reference reader-reference-line"
                dir="ltr"
                lang="en"
                style={{ fontSize: `${Math.max(fontSize - 1, 13)}px` }}
              >
                {highlightText(caption, highlightQuery)}
                {block.source && block.source !== 'quran' && (
                  <span className="reader-accent"> — {block.source}</span>
                )}
              </p>
            );
          }

          case 'image': {
            const align = block.align ?? 'center';
            const width = block.width ?? (align === 'full' ? 'full' : 'large');
            return (
              <figure
                key={i}
                className={cn(
                  'reader-image',
                  align === 'left' && 'reader-image-left',
                  align === 'center' && 'reader-image-center',
                  align === 'right' && 'reader-image-right',
                  align === 'full' && 'reader-image-full',
                  align === 'wrap-left' && 'reader-image-wrap-left',
                  align === 'wrap-right' && 'reader-image-wrap-right',
                  width === 'small' && 'reader-image-w-small',
                  width === 'medium' && 'reader-image-w-medium',
                  width === 'large' && 'reader-image-w-large',
                  width === 'full' && 'reader-image-w-full',
                )}
              >
                <ResolvedImage
                  url={block.url}
                  storagePath={block.storagePath}
                  bucket={block.bucket}
                  alt={block.alt || block.caption || block.fileName || ''}
                />
                {block.caption && (
                  <figcaption style={{ fontSize: `${small}px` }}>
                    {block.caption}
                    {block.pdfPage != null ? ` · Page ${block.pdfPage}` : ''}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'urdu':
            return (
              <p
                key={i}
                className={cn('reader-urdu', blockClass('ur', 'rtl'))}
                dir="rtl"
                lang="ur"
                style={{ fontSize: `${arabicSize}px`, lineHeight: 2.25 }}
              >
                {highlightText(block.text, highlightQuery)}
              </p>
            );

          case 'bilingual':
            return (
              <div key={i} className="reader-bilingual my-4 space-y-2">
                {block.arabic && (
                  <p
                    className="reader-arabic"
                    dir="rtl"
                    lang="ar"
                    style={{ fontSize: `${arabicSize}px`, lineHeight: 2.35 }}
                  >
                    {highlightText(block.arabic, highlightQuery)}
                  </p>
                )}
                {block.translation && (
                  <p
                    className="reader-muted"
                    dir="ltr"
                    lang="en"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {highlightText(block.translation, highlightQuery)}
                  </p>
                )}
              </div>
            );

          case 'callout': {
            const isClaim = block.variant === 'claim';
            return (
              <aside
                key={i}
                className={cn(
                  'reader-callout my-4 rounded-md border px-3 py-3 sm:px-4',
                  isClaim ? 'reader-callout-claim' : 'reader-callout-info',
                )}
              >
                {isClaim && (block.claim || block.response) ? (
                  <>
                    {block.claim && (
                      <p className="mb-2 text-[14px]" style={{ color: 'var(--reader-text)' }}>
                        <strong>Claim:</strong> {highlightText(block.claim, highlightQuery)}
                      </p>
                    )}
                    {block.response && (
                      <p className="text-[14px]" style={{ color: 'var(--reader-text)' }}>
                        <strong>Response:</strong> {highlightText(block.response, highlightQuery)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[14px]" style={{ color: 'var(--reader-text)' }}>
                    {highlightText(block.text, highlightQuery)}
                  </p>
                )}
              </aside>
            );
          }

          case 'endnote':
            return (
              <aside
                key={i}
                className="reader-endnote my-3"
                style={{ fontSize: `${Math.max(fontSize - 3, 12)}px` }}
              >
                <sup className="reader-accent font-medium">[{block.number}]</sup>{' '}
                <span className="reader-muted">{highlightText(block.text, highlightQuery)}</span>
              </aside>
            );

          case 'citation':
            return (
              <cite
                key={i}
                className="reader-citation my-3 block not-italic"
                style={{ fontSize: `${Math.max(fontSize - 1, 13)}px`, color: 'var(--reader-muted)' }}
              >
                {highlightText(block.text, highlightQuery)}
              </cite>
            );

          case 'table':
            return (
              <div key={i} className="reader-table-wrap my-4 overflow-x-auto">
                <table className="reader-table w-full border-collapse text-left text-[13px] sm:text-[14px]">
                  {block.headers.length > 0 && (
                    <thead>
                      <tr>
                        {block.headers.map((h, hi) => (
                          <th key={hi} className="border reader-border px-2 py-1.5 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border reader-border px-2 py-1.5 reader-muted">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'audio':
            return (
              <AttachmentBlock
                key={i}
                kind="audio"
                fileName={block.fileName}
                caption={block.caption}
                storagePath={block.storagePath}
                bucket={block.bucket}
                url={block.url}
                pdfPage={block.pdfPage}
              />
            );

          case 'pdf':
            return (
              <AttachmentBlock
                key={i}
                kind="pdf"
                fileName={block.fileName}
                caption={block.caption}
                storagePath={block.storagePath}
                bucket={block.bucket}
                url={block.url}
                pdfPage={block.pdfPage}
              />
            );

          case 'html':
            return (
              <div
                key={i}
                className="reader-html-fallback my-3"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );

          default:
            // Never hide the whole book for an unknown block
            return (
              <p key={i} className="reader-muted my-2 text-[13px] italic opacity-70">
                [Unsupported content block]
              </p>
            );
        }
      })}
    </div>
  );
}
