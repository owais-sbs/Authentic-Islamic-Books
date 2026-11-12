/**
 * RichTextEditor — contentEditable scholarly editor (Word/PDF paste friendly).
 * Outputs HTML stored in section.content. Supports mid-content images with
 * alignment / width / caption / alt / replace / delete controls.
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Highlighter,
  Languages,
  ImagePlus,
  Trash2,
  Replace,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  snippetForBlock,
  type ImageAlignOption,
  type ImageWidthOption,
} from '@/features/books/manual/blockSnippets';
import { uploadBookContentImage } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  /** Book id — used to upload content images to Supabase Storage */
  bookId?: string;
  /** Insert HTML at caret (used by block inserter). */
  insertHtmlRef?: React.MutableRefObject<((html: string) => void) | null>;
  /** Opens the image file picker (used by Upload image beside Insert block). */
  uploadImageRef?: React.MutableRefObject<(() => void) | null>;
}

interface ToolbarButton {
  icon: React.ElementType;
  command: string;
  value?: string;
  title: string;
}

const TOOLBAR: (ToolbarButton | 'sep')[] = [
  { icon: Undo2, command: 'undo', title: 'Undo' },
  { icon: Redo2, command: 'redo', title: 'Redo' },
  'sep',
  { icon: Bold, command: 'bold', title: 'Bold' },
  { icon: Italic, command: 'italic', title: 'Italic' },
  { icon: Underline, command: 'underline', title: 'Underline' },
  { icon: Highlighter, command: 'hiliteColor', value: '#FEF3C7', title: 'Highlight' },
  'sep',
  { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading' },
  { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Subheading' },
  'sep',
  { icon: List, command: 'insertUnorderedList', title: 'Bullet list' },
  { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered list' },
  {
    icon: Quote,
    command: 'formatBlock',
    value: 'blockquote',
    title: 'Blockquote — Enter exits to paragraph, Shift+Enter stays in quote',
  },
  'sep',
  { icon: AlignLeft, command: 'justifyLeft', title: 'Align left' },
  { icon: AlignCenter, command: 'justifyCenter', title: 'Align center' },
  { icon: AlignRight, command: 'justifyRight', title: 'Align right' },
  'sep',
  { icon: LinkIcon, command: 'createLink', title: 'Insert link' },
];

const WIDTH_CSS: Record<ImageWidthOption, string> = {
  small: 'max-width:min(100%,16rem)',
  medium: 'max-width:min(100%,28rem)',
  large: 'max-width:min(100%,36rem)',
  full: 'max-width:100%',
};

function findFigureFromNode(node: Node | null): HTMLElement | null {
  let el: Node | null = node;
  while (el) {
    if (el instanceof HTMLElement) {
      if (el.tagName === 'FIGURE' && el.classList.contains('content-image')) return el;
      if (el.tagName === 'IMG') {
        const fig = el.closest('figure.content-image');
        if (fig instanceof HTMLElement) return fig;
      }
    }
    el = el.parentNode;
  }
  return null;
}

function applyFigureLayout(figure: HTMLElement, align: ImageAlignOption, width: ImageWidthOption) {
  const resolvedWidth = align === 'full' ? 'full' : width;
  figure.setAttribute('data-align', align);
  figure.setAttribute('data-width', resolvedWidth);
  figure.className = `content-image content-image-${align}`;

  let style =
    align === 'wrap-left'
      ? 'float:left;margin:0.5rem 1.25rem 0.75rem 0;max-width:min(100%,42%)'
      : align === 'wrap-right'
        ? 'float:right;margin:0.5rem 0 0.75rem 1.25rem;max-width:min(100%,42%)'
        : align === 'left'
          ? 'text-align:left;margin-right:auto'
          : align === 'right'
            ? 'text-align:right;margin-left:auto'
            : align === 'full'
              ? 'text-align:center;margin-left:auto;margin-right:auto;width:100%'
              : 'text-align:center;margin-left:auto;margin-right:auto';
  figure.setAttribute('style', style);

  const img = figure.querySelector('img');
  if (img) {
    img.setAttribute(
      'style',
      `${WIDTH_CSS[resolvedWidth]};height:auto;border-radius:0.5rem;display:inline-block`,
    );
  }
}

/** Strip Word junk while keeping basic structure. */
function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, meta, link, xml, o\\:p').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((el) => {
    const allowed = new Set([
      'style',
      'href',
      'src',
      'alt',
      'dir',
      'lang',
      'class',
      'colspan',
      'rowspan',
      'data-align',
      'data-width',
      'contenteditable',
    ]);
    [...el.attributes].forEach((attr) => {
      if (!allowed.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
      if (attr.name === 'style') {
        const keep = attr.value
          .split(';')
          .filter((p) =>
            /^(direction|text-align|font-weight|font-style|text-decoration|max-width|margin|float|width|height|border-radius|display)/i.test(
              p.trim(),
            ),
          )
          .join(';');
        if (keep) el.setAttribute('style', keep);
        else el.removeAttribute('style');
      }
    });
  });
  return doc.body.innerHTML;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste chapter content…',
  minHeight = '280px',
  className,
  bookId,
  insertHtmlRef,
  uploadImageRef,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const initialised = useRef(false);
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [imageAlign, setImageAlign] = useState<ImageAlignOption>('center');
  const [imageWidth, setImageWidth] = useState<ImageWidthOption>('large');
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedFigure, setSelectedFigure] = useState<HTMLElement | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [altDraft, setAltDraft] = useState('');

  useEffect(() => {
    if (editorRef.current && !initialised.current) {
      editorRef.current.innerHTML = value || '';
      initialised.current = true;
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current || !initialised.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emit = useCallback(() => {
    onChange(editorRef.current?.innerHTML ?? '');
  }, [onChange]);

  const insertHtml = useCallback(
    (html: string) => {
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, html);
      emit();
    },
    [emit],
  );

  useEffect(() => {
    if (insertHtmlRef) insertHtmlRef.current = insertHtml;
    return () => {
      if (insertHtmlRef) insertHtmlRef.current = null;
    };
  }, [insertHtml, insertHtmlRef]);

  useEffect(() => {
    if (!uploadImageRef) return;
    uploadImageRef.current = () => imageInputRef.current?.click();
    return () => {
      uploadImageRef.current = null;
    };
  }, [uploadImageRef]);

  const exec = useCallback(
    (command: string, cmdValue?: string) => {
      if (command === 'createLink') {
        const url = window.prompt('Enter URL:', 'https://');
        if (url) document.execCommand('createLink', false, url);
      } else if (command === 'hiliteColor') {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('hiliteColor', false, cmdValue);
      } else if (command === 'formatBlock' && cmdValue === 'blockquote') {
        // Toggle: quote → normal paragraph when already inside a blockquote
        const inQuote = document.queryCommandValue('formatBlock').toLowerCase() === 'blockquote';
        if (inQuote) {
          document.execCommand('formatBlock', false, 'p');
        } else {
          document.execCommand('formatBlock', false, 'blockquote');
          const sel = window.getSelection();
          const node = sel?.anchorNode;
          const el = node instanceof Element ? node : node?.parentElement;
          const bq = el?.closest('blockquote');
          if (bq && !bq.classList.contains('content-quote')) {
            bq.classList.add('content-quote');
          }
        }
      } else {
        document.execCommand(command, false, cmdValue);
      }
      editorRef.current?.focus();
      emit();
    },
    [emit],
  );

  /** Enter exits a blockquote or callout/claim div into a normal paragraph below; Shift+Enter stays inside. */
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editorRef.current) return;

    const anchor = sel.anchorNode;
    const el = anchor instanceof Element ? anchor : anchor?.parentElement;

    // Exit blockquote on Enter
    const quote = el?.closest('blockquote');
    if (quote && editorRef.current.contains(quote)) {
      e.preventDefault();
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      quote.after(p);
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      emit();
      return;
    }

    // Exit content-callout / content-claim div on Enter at the end of the last paragraph
    const callout = el?.closest('.content-callout');
    if (callout && editorRef.current.contains(callout)) {
      const paragraphs = Array.from(callout.querySelectorAll('p'));
      const lastPara = paragraphs[paragraphs.length - 1];
      const inLast = lastPara && lastPara.contains((anchor ?? el) ?? null);
      if (inLast) {
        const range = sel.getRangeAt(0);
        const endNode = range.endContainer;
        const atEnd =
          range.collapsed &&
          (endNode.nodeType === Node.TEXT_NODE
            ? range.endOffset === (endNode as Text).length &&
              endNode === lastPara.lastChild
            : endNode === lastPara);
        if (atEnd) {
          e.preventDefault();
          const p = document.createElement('p');
          p.appendChild(document.createElement('br'));
          (callout as HTMLElement).after(p);
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          emit();
          return;
        }
      }
    }
  }

  function selectFigure(figure: HTMLElement | null) {
    editorRef.current?.querySelectorAll('figure.content-image.is-selected').forEach((el) => {
      el.classList.remove('is-selected');
    });
    if (figure) {
      figure.classList.add('is-selected');
      setSelectedFigure(figure);
      setCaptionDraft(figure.querySelector('figcaption')?.textContent ?? '');
      setAltDraft(figure.querySelector('img')?.getAttribute('alt') ?? '');
      const a = (figure.getAttribute('data-align') || 'center') as ImageAlignOption;
      const w = (figure.getAttribute('data-width') || 'large') as ImageWidthOption;
      setImageAlign(a);
      setImageWidth(w);
    } else {
      setSelectedFigure(null);
    }
  }

  function handleEditorClick(e: React.MouseEvent) {
    const figure = findFigureFromNode(e.target as Node);
    selectFigure(figure);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      e.preventDefault();
      insertHtml(sanitizePastedHtml(html));
    } else if (text) {
      e.preventDefault();
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
      insertHtml(escaped);
    }
  }

  function handleDrop(e: React.DragEvent) {
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.preventDefault();
    void handleImagePick(file, false);
  }

  function toggleRtl() {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    if (editorRef.current) {
      editorRef.current.setAttribute('dir', next);
      emit();
    }
  }

  async function resolveImageUrl(file: File): Promise<string> {
    if (bookId && isSupabaseConfigured()) {
      try {
        const uploaded = await uploadBookContentImage(bookId, file, file.name);
        return uploaded.publicUrl;
      } catch (err) {
        console.warn('[RichTextEditor] Storage upload failed, using local data URL', err);
      }
    }
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read image'));
      reader.readAsDataURL(file);
    });
  }

  async function handleImagePick(file: File | undefined, replaceSelected: boolean) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 8 * 1024 * 1024) {
      window.alert('Please choose an image under 8 MB.');
      return;
    }

    setImageUploading(true);
    try {
      const url = await resolveImageUrl(file);
      if (replaceSelected && selectedFigure) {
        const img = selectedFigure.querySelector('img');
        if (img) {
          img.setAttribute('src', url);
          emit();
        }
      } else {
        insertHtml(snippetForBlock('image', url, imageAlign, imageWidth));
      }
      setShowImageMenu(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  }

  function updateSelectedAlign(align: ImageAlignOption) {
    if (!selectedFigure) return;
    setImageAlign(align);
    applyFigureLayout(selectedFigure, align, imageWidth);
    emit();
  }

  function updateSelectedWidth(width: ImageWidthOption) {
    if (!selectedFigure) return;
    setImageWidth(width);
    applyFigureLayout(selectedFigure, imageAlign, width);
    emit();
  }

  function applyCaptionAndAlt() {
    if (!selectedFigure) return;
    let caption = selectedFigure.querySelector('figcaption');
    if (!caption) {
      caption = document.createElement('figcaption');
      selectedFigure.appendChild(caption);
    }
    caption.textContent = captionDraft;
    const img = selectedFigure.querySelector('img');
    if (img) img.setAttribute('alt', altDraft);
    emit();
  }

  function deleteSelectedImage() {
    if (!selectedFigure) return;
    selectedFigure.remove();
    setSelectedFigure(null);
    emit();
  }

  return (
    <div className={cn('overflow-visible rounded-lg border border-[#E5E1D8] bg-white shadow-sm', className)}>
      <div className="flex max-w-full flex-wrap items-center gap-0.5 overflow-x-auto bg-[#F7F6F2] px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TOOLBAR.map((item, i) =>
          item === 'sep' ? (
            <span key={`sep-${i}`} className="mx-1 h-4 w-px bg-[#E5E1D8]" />
          ) : (
            <button
              key={item.command + (item.value ?? '') + i}
              type="button"
              title={item.title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(item.command, item.value);
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#E5E1D8] hover:text-[#0B1B2B]"
            >
              <item.icon size={14} />
            </button>
          ),
        )}
        <span className="mx-1 h-4 w-px bg-[#E5E1D8]" />
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            title="Image placement options"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowImageMenu((v) => !v);
            }}
            className={cn(
              'inline-flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors',
              showImageMenu
                ? 'bg-[#104C3B]/15 text-[#104C3B]'
                : 'text-[#64748B] hover:bg-[#E5E1D8] hover:text-[#0B1B2B]',
            )}
          >
            <ImagePlus size={13} />
            {imageUploading ? 'Uploading…' : 'Image options'}
          </button>
          {showImageMenu && (
            <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-[#E5E1D8] bg-white py-1 shadow-lg">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Placement
              </p>
              {(
                [
                  { id: 'left', label: 'Left' },
                  { id: 'center', label: 'Center' },
                  { id: 'right', label: 'Right' },
                  { id: 'full', label: 'Full width' },
                  { id: 'wrap-left', label: 'Wrap left' },
                  { id: 'wrap-right', label: 'Wrap right' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setImageAlign(opt.id);
                    if (selectedFigure) applyFigureLayout(selectedFigure, opt.id, imageWidth);
                    emit();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F7F6F2]',
                    imageAlign === opt.id ? 'bg-[#104C3B]/8 font-semibold text-[#104C3B]' : 'text-[#0B1B2B]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <p className="mt-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Size
              </p>
              {(
                [
                  { id: 'small', label: 'Small' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'large', label: 'Large' },
                  { id: 'full', label: 'Full' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setImageWidth(opt.id);
                    if (selectedFigure) applyFigureLayout(selectedFigure, imageAlign, opt.id);
                    emit();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F7F6F2]',
                    imageWidth === opt.id ? 'bg-[#104C3B]/8 font-semibold text-[#104C3B]' : 'text-[#0B1B2B]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <div className="my-1 h-px bg-[#F1F0EB]" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  imageInputRef.current?.click();
                  setShowImageMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[#104C3B] hover:bg-[#F7F6F2]"
              >
                <ImagePlus size={14} />
                {imageUploading ? 'Uploading…' : 'Upload image…'}
              </button>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              void handleImagePick(e.target.files?.[0], false);
              e.target.value = '';
            }}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              void handleImagePick(e.target.files?.[0], true);
              e.target.value = '';
            }}
          />
        </div>
        <span className="mx-1 h-4 w-px bg-[#E5E1D8]" />
        <button
          type="button"
          title={dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL (Arabic)'}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleRtl();
          }}
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors',
            dir === 'rtl'
              ? 'bg-[#104C3B]/15 text-[#104C3B]'
              : 'text-[#64748B] hover:bg-[#E5E1D8] hover:text-[#0B1B2B]',
          )}
        >
          <Languages size={13} />
          {dir.toUpperCase()}
        </button>
      </div>

      {selectedFigure && (
        <div className="flex flex-wrap items-end gap-2 border-b border-[#E5E1D8] bg-[#FAFAF8] px-3 py-2">
          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Align
            </label>
            <select
              value={imageAlign}
              onChange={(e) => updateSelectedAlign(e.target.value as ImageAlignOption)}
              className="rounded border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="full">Full width</option>
              <option value="wrap-left">Wrap left</option>
              <option value="wrap-right">Wrap right</option>
            </select>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Width
            </label>
            <select
              value={imageWidth}
              onChange={(e) => updateSelectedWidth(e.target.value as ImageWidthOption)}
              className="rounded border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="min-w-[8rem] flex-1 space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Caption
            </label>
            <input
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              onBlur={applyCaptionAndAlt}
              className="w-full rounded border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
              placeholder="Caption"
            />
          </div>
          <div className="min-w-[8rem] flex-1 space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Alt text
            </label>
            <input
              value={altDraft}
              onChange={(e) => setAltDraft(e.target.value)}
              onBlur={applyCaptionAndAlt}
              className="w-full rounded border border-[#E5E1D8] bg-white px-2 py-1 text-[12px]"
              placeholder="Describe the image"
            />
          </div>
          <button
            type="button"
            title="Replace image"
            onClick={() => replaceInputRef.current?.click()}
            className="inline-flex h-8 items-center gap-1 rounded border border-[#E5E1D8] bg-white px-2 text-[11px] font-medium text-[#0B1B2B] hover:border-[#C9A646]"
          >
            <Replace size={13} />
            Replace
          </button>
          <button
            type="button"
            title="Delete image"
            onClick={deleteSelectedImage}
            className="inline-flex h-8 items-center gap-1 rounded border border-red-200 bg-white px-2 text-[11px] font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 size={13} />
            Delete
          </button>
          <button
            type="button"
            title="Deselect"
            onClick={() => selectFigure(null)}
            className="inline-flex h-8 items-center gap-1 rounded border border-[#E5E1D8] bg-white px-2 text-[11px] text-[#64748B]"
          >
            <Maximize2 size={13} />
            Done
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        onInput={emit}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleEditorClick}
        onDrop={handleDrop}
        onDragOver={(e) => {
          if ([...e.dataTransfer.types].includes('Files')) e.preventDefault();
        }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={cn(
          'px-4 py-3 text-[14px] leading-relaxed text-[#0B1B2B] outline-none',
          'prose prose-sm max-w-none',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#94A3B8]',
          '[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold',
          '[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold',
          '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A646] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#64748B]',
          '[&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal',
          '[&_p]:my-1.5',
          '[&_a]:text-[#C9A646] [&_a]:underline',
          '[&_.content-arabic]:font-[Scheherazade_New,Noto_Naskh_Arabic,Amiri,serif] [&_.content-arabic]:text-[1.35em] [&_.content-arabic]:leading-[2.4] [&_.content-arabic]:text-[#104C3B]',
          '[&_.content-urdu]:font-[Noto_Nastaliq_Urdu,Amiri,serif] [&_.content-urdu]:text-[1.25em] [&_.content-urdu]:leading-[2.2]',
          '[&_.content-bilingual]:my-3 [&_.content-bilingual]:space-y-1',
          '[&_.content-quran]:border-l-[#104C3B] [&_.content-hadith]:border-l-[#8C7030]',
          '[&_.content-claim]:my-3 [&_.content-footnote]:text-[12px] [&_.content-endnote]:text-[12px] [&_.content-reference]:text-[12px] [&_.content-reference]:text-[#64748B]',
          '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md',
          '[&_figure.content-image]:my-4 [&_figure.content-image]:block',
          '[&_figure.content-image.is-selected]:outline [&_figure.content-image.is-selected]:outline-2 [&_figure.content-image.is-selected]:outline-[#C9A646]',
          '[&_figure.content-image figcaption]:mt-1.5 [&_figure.content-image figcaption]:text-center [&_figure.content-image figcaption]:text-[12px] [&_figure.content-image figcaption]:text-[#64748B]',
          '[&_figure.content-audio]:max-w-full [&_figure.content-pdf]:max-w-full',
          '[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#E5E1D8] [&_th]:p-2 [&_td]:border [&_td]:border-[#E5E1D8] [&_td]:p-2',
        )}
      />
    </div>
  );
}
