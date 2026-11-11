/**
 * Admin media / attachment manager — Storage paths only, signed URLs for private files.
 */
import { useMemo, useRef, useState } from 'react';
import {
  FileAudio,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  ExternalLink,
  UploadCloud,
  PencilLine,
} from 'lucide-react';
import type { BookAttachment, BookWithStructure } from '../types';
import {
  getAttachmentSignedUrl,
  removeBookAttachmentObject,
  uploadBookAttachment,
  uploadBookContentImage,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { snippetForBlock } from '@/features/books/manual/blockSnippets';
import { cn } from '@/lib/utils';

interface BookMediaManagerProps {
  book: BookWithStructure;
  onChange: (patch: Partial<BookWithStructure>) => void;
}

const inputCls =
  'w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]';

export function BookMediaManager({ book, onChange }: BookMediaManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [kindHint, setKindHint] = useState<'auto' | 'audio' | 'pdf' | 'image'>('auto');
  const [dragOver, setDragOver] = useState(false);

  const sections = useMemo(
    () =>
      book.chapters.flatMap((ch) =>
        ch.sections.map((s) => ({
          id: s.id,
          chapterId: ch.id,
          label: `${s.title || 'Untitled'} · Page ${s.pdfPageStart ?? s.number}`,
        })),
      ),
    [book.chapters],
  );

  const attachments = book.attachments ?? [];

  function patchSectionContent(targetSectionId: string, appendHtml: string) {
    onChange({
      chapters: book.chapters.map((ch) => ({
        ...ch,
        sections: ch.sections.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, content: `${sec.content || ''}${appendHtml}` }
            : sec,
        ),
      })),
    });
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isSupabaseConfigured()) {
      setError('Supabase is required to store attachments as Storage paths.');
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const isImage = file.type.startsWith('image/') || kindHint === 'image';
      const section = sections.find((s) => s.id === sectionId);
      const pageNum = pdfPage ? Number(pdfPage) : undefined;

      let attachment: BookAttachment;
      let insertHtml = '';

      if (isImage) {
        const uploaded = await uploadBookContentImage(book.id, file, file.name);
        attachment = {
          id: crypto.randomUUID(),
          kind: 'image',
          storagePath: uploaded.path,
          bucket: 'book-images',
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          caption: caption || undefined,
          pdfPage: pageNum,
          chapterId: section?.chapterId,
          sectionId: section?.id,
          createdAt: new Date().toISOString(),
        };
        insertHtml = snippetForBlock('image', uploaded.publicUrl, 'center', 'large');
      } else {
        const kind =
          kindHint === 'audio' || kindHint === 'pdf'
            ? kindHint
            : file.type.startsWith('audio/')
              ? 'audio'
              : 'pdf';
        attachment = await uploadBookAttachment(book.id, file, {
          kind,
          caption: caption || undefined,
          pdfPage: pageNum,
          chapterId: section?.chapterId,
          sectionId: section?.id,
        });
        const signed = await getAttachmentSignedUrl(attachment.bucket, attachment.storagePath).catch(
          () => undefined,
        );
        insertHtml = snippetForBlock(
          kind,
          undefined,
          'center',
          'large',
          {
            url: signed,
            fileName: attachment.fileName,
            storagePath: attachment.storagePath,
            bucket: attachment.bucket,
            caption: attachment.caption,
            pdfPage: attachment.pdfPage,
            attachmentId: attachment.id,
          },
        );
      }

      onChange({ attachments: [...attachments, attachment] });

      if (section?.id) {
        patchSectionContent(section.id, insertHtml);
        setSuccess(`Uploaded and inserted into “${section.label}”.`);
      } else {
        setSuccess('Uploaded. Link a section, then use “Insert into section” to place it in the text.');
      }

      setCaption('');
      setPdfPage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function openAttachment(att: BookAttachment) {
    try {
      const url = await getAttachmentSignedUrl(att.bucket, att.storagePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open file');
    }
  }

  async function insertAttachmentIntoSection(att: BookAttachment) {
    const targetId = att.sectionId || sectionId;
    if (!targetId) {
      setError('Choose a section above (or set one on the attachment) before inserting.');
      return;
    }
    setError(null);
    try {
      let html = '';
      if (att.kind === 'image') {
        const url = await getAttachmentSignedUrl(att.bucket, att.storagePath);
        html = snippetForBlock('image', url, 'center', 'large');
      } else if (att.kind === 'audio' || att.kind === 'pdf') {
        const signed = await getAttachmentSignedUrl(att.bucket, att.storagePath).catch(
          () => undefined,
        );
        html = snippetForBlock(att.kind, undefined, 'center', 'large', {
          url: signed,
          fileName: att.fileName,
          storagePath: att.storagePath,
          bucket: att.bucket,
          caption: att.caption,
          pdfPage: att.pdfPage,
          attachmentId: att.id,
        });
      } else {
        setError('This attachment type cannot be inserted into content.');
        return;
      }
      onChange({
        attachments: attachments.map((a) =>
          a.id === att.id ? { ...a, sectionId: targetId } : a,
        ),
        chapters: book.chapters.map((ch) => ({
          ...ch,
          sections: ch.sections.map((sec) =>
            sec.id === targetId
              ? { ...sec, content: `${sec.content || ''}${html}` }
              : sec,
          ),
        })),
      });
      setSuccess('Inserted into section content.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not insert attachment');
    }
  }

  async function removeAttachment(att: BookAttachment) {
    if (!window.confirm(`Remove “${att.fileName}” from this book?`)) return;
    try {
      await removeBookAttachmentObject(att);
    } catch {
      /* Storage delete is best-effort */
    }
    onChange({ attachments: attachments.filter((a) => a.id !== att.id) });
  }

  function updateAttachment(attId: string, patch: Partial<BookAttachment>) {
    onChange({
      attachments: attachments.map((a) => (a.id === attId ? { ...a, ...patch } : a)),
    });
  }

  function KindIcon({ kind }: { kind: BookAttachment['kind'] }) {
    if (kind === 'audio') return <FileAudio size={16} className="text-[#104C3B]" />;
    if (kind === 'image') return <ImageIcon size={16} className="text-[#104C3B]" />;
    return <FileText size={16} className="text-[#104C3B]" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E1D8] bg-white shadow-sm">
      <div className="bg-[#FAFAF8] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#0B1B2B]">Media & attachments</h3>
        <p className="mt-0.5 text-[12px] text-[#64748B]">
          Upload images, audio, or PDFs. Link them to a page/section — they appear in the reader and can be inserted into the text.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Type
            </label>
            <select
              className={inputCls}
              value={kindHint}
              onChange={(e) => setKindHint(e.target.value as typeof kindHint)}
            >
              <option value="auto">Auto-detect from file</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Page number
            </label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={pdfPage}
              onChange={(e) => setPdfPage(e.target.value)}
              placeholder="Optional — e.g. 5"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Link to section
            </label>
            <select
              className={inputCls}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              <option value="">Book-level (choose later)</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Caption
            </label>
            <input
              className={inputCls}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption or note"
            />
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,audio/*,application/pdf,.pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <button
          type="button"
          disabled={busy || !book.id}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors',
            dragOver
              ? 'border-[#C9A646] bg-[#C9A646]/10'
              : 'border-[#E5E1D8] bg-[#FAFAF8] hover:border-[#C9A646]/70 hover:bg-[#C9A646]/5',
            'disabled:opacity-50',
          )}
        >
          <UploadCloud size={28} className="text-[#C9A646]" />
          <span className="text-[13px] font-semibold text-[#0B1B2B]">
            {busy ? 'Uploading…' : 'Drop a file here or click to upload'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <Paperclip size={12} />
            Images, audio, or PDF · max practical size for review
          </span>
        </button>

        {error && <p className="text-[12px] text-red-600">{error}</p>}
        {success && <p className="text-[12px] text-[#104C3B]">{success}</p>}

        {attachments.length === 0 ? (
          <p className="text-[12px] text-[#94A3B8]">No attachments yet.</p>
        ) : (
          <ul className="space-y-2">
            {attachments.map((att) => (
              <li
                key={att.id}
                className="rounded-xl border border-[#E5E1D8] bg-[#FAFAF8] px-3 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    <KindIcon kind={att.kind} />
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-[13px] font-medium text-[#0B1B2B]">{att.fileName}</p>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="number"
                          min={1}
                          className="w-24 rounded-md border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
                          value={att.pdfPage ?? ''}
                          placeholder="Page"
                          onChange={(e) =>
                            updateAttachment(att.id, {
                              pdfPage: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          title="Page number"
                        />
                        <select
                          className="max-w-[14rem] rounded-md border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
                          value={att.sectionId ?? ''}
                          onChange={(e) =>
                            updateAttachment(att.id, {
                              sectionId: e.target.value || undefined,
                              chapterId: sections.find((s) => s.id === e.target.value)?.chapterId,
                            })
                          }
                        >
                          <option value="">No section</option>
                          {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <input
                          className="min-w-[8rem] flex-1 rounded-md border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
                          value={att.caption ?? ''}
                          placeholder="Caption"
                          onChange={(e) => updateAttachment(att.id, { caption: e.target.value })}
                        />
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        {att.kind}
                        {att.pdfPage != null ? ` · Page ${att.pdfPage}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => void insertAttachmentIntoSection(att)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#104C3B] px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#0d3d2f]"
                    >
                      <PencilLine size={13} /> Insert into section
                    </button>
                    <button
                      type="button"
                      onClick={() => void openAttachment(att)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-[#64748B] hover:bg-white"
                    >
                      <ExternalLink size={13} /> Open
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeAttachment(att)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
