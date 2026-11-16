/**
 * Renders audio / supplemental PDF attachments using Storage paths.
 * Private buckets use short-lived signed URLs — never unrestricted public URLs.
 */
import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileAudio, FileText, AlertCircle } from 'lucide-react';
import { getAttachmentSignedUrl } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { BookAttachment } from '@/features/books/types';

type AttachmentBucket = BookAttachment['bucket'];

interface AttachmentBlockProps {
  kind: 'audio' | 'pdf';
  fileName?: string;
  caption?: string;
  storagePath?: string;
  bucket?: string;
  url?: string;
  pdfPage?: number;
  align?: 'left' | 'center' | 'right';
}

function resolveBucket(raw?: string): AttachmentBucket {
  if (raw === 'book-images' || raw === 'book-pdfs' || raw === 'book-attachments') return raw;
  return 'book-attachments';
}

export function AttachmentBlock({
  kind,
  fileName,
  caption,
  storagePath,
  bucket,
  url: initialUrl,
  pdfPage,
  align = 'center',
}: AttachmentBlockProps) {
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialUrl && Boolean(storagePath));

  useEffect(() => {
    let cancelled = false;
    if (initialUrl || !storagePath || !isSupabaseConfigured()) {
      setLoading(false);
      if (!initialUrl && storagePath && !isSupabaseConfigured()) {
        setError('Attachments require Supabase Storage.');
      }
      return;
    }

    setLoading(true);
    setError(null);
    void getAttachmentSignedUrl(resolveBucket(bucket), storagePath)
      .then((signed) => {
        if (!cancelled) setUrl(signed);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Could not open attachment';
          // Private bucket without anon SELECT — expected until SQL policy is applied
          setError(
            /not found|bucket|policy|row-level|jwt|sign/i.test(msg)
              ? 'Private attachment unavailable. Sign in as admin, or apply the signed-URL storage policy for book-attachments.'
              : msg,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialUrl, storagePath, bucket]);

  const title = fileName || (kind === 'audio' ? 'Audio explanation' : 'PDF attachment');

  const alignStyle: React.CSSProperties =
    align === 'left'
      ? { marginLeft: 0, marginRight: 'auto' }
      : align === 'right'
        ? { marginLeft: 'auto', marginRight: 0 }
        : { marginLeft: 'auto', marginRight: 'auto' };

  return (
    <figure
      className="reader-attachment my-5 rounded-lg border reader-border reader-card p-3 sm:p-4"
      style={{ maxWidth: '36rem', display: 'block', ...alignStyle }}
    >
      <figcaption className="mb-2 flex flex-wrap items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--reader-text)' }}>
        {kind === 'audio' ? <FileAudio size={16} /> : <FileText size={16} />}
        <span>{title}</span>
        {pdfPage != null && (
          <span className="reader-muted text-[11px] font-normal">Page {pdfPage}</span>
        )}
      </figcaption>
      {caption && caption !== title && (
        <p className="reader-muted mb-2 text-[12px]">{caption}</p>
      )}

      {loading && <p className="reader-muted text-[12px]">Loading attachment…</p>}

      {error && (
        <p className="flex items-start gap-1.5 text-[12px] text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {!loading && !error && url && kind === 'audio' && (
        <audio controls preload="metadata" src={url} className="w-full max-w-full">
          Your browser does not support audio playback.
        </audio>
      )}

      {!loading && !error && url && kind === 'pdf' && (
        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border reader-border px-3 py-2 text-[12px] font-medium hover:opacity-90"
            style={{ color: 'var(--reader-text)' }}
          >
            <ExternalLink size={14} />
            Open PDF
          </a>
          <a
            href={url}
            download={fileName || 'attachment.pdf'}
            className="inline-flex items-center gap-1.5 rounded-md border reader-border px-3 py-2 text-[12px] font-medium hover:opacity-90"
            style={{ color: 'var(--reader-text)' }}
          >
            <Download size={14} />
            Download
          </a>
        </div>
      )}
    </figure>
  );
}
