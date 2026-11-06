/**
 * RichTextEditor — contentEditable scholarly editor (Word/PDF paste friendly).
 * Outputs HTML stored in section.content. Swap-ready for TipTap later.
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { snippetForBlock } from '@/features/books/manual/blockSnippets';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  /** Insert HTML at caret (used by block inserter). */
  insertHtmlRef?: React.MutableRefObject<((html: string) => void) | null>;
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
  { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Blockquote' },
  'sep',
  { icon: AlignLeft, command: 'justifyLeft', title: 'Align left' },
  { icon: AlignCenter, command: 'justifyCenter', title: 'Align center' },
  { icon: AlignRight, command: 'justifyRight', title: 'Align right' },
  'sep',
  { icon: LinkIcon, command: 'createLink', title: 'Insert link' },
];

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
    ]);
    [...el.attributes].forEach((attr) => {
      if (!allowed.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
      if (attr.name === 'style') {
        const keep = attr.value
          .split(';')
          .filter((p) => /^(direction|text-align|font-weight|font-style|text-decoration)/i.test(p.trim()))
          .join(';');
        if (keep) el.setAttribute('style', keep);
        else el.removeAttribute('style');
      }
    });
  });
  return doc.body.innerHTML;
}

type ImageAlign = 'left' | 'center' | 'right';

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste chapter content…',
  minHeight = '280px',
  className,
  insertHtmlRef,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initialised = useRef(false);
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [imageAlign, setImageAlign] = useState<ImageAlign>('center');
  const [showImageMenu, setShowImageMenu] = useState(false);

  useEffect(() => {
    if (editorRef.current && !initialised.current) {
      editorRef.current.innerHTML = value || '';
      initialised.current = true;
    }
  }, [value]);

  // Sync external value when switching chapters
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

  const exec = useCallback(
    (command: string, cmdValue?: string) => {
      if (command === 'createLink') {
        const url = window.prompt('Enter URL:', 'https://');
        if (url) document.execCommand('createLink', false, url);
      } else if (command === 'hiliteColor') {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('hiliteColor', false, cmdValue);
      } else {
        document.execCommand(command, false, cmdValue);
      }
      editorRef.current?.focus();
      emit();
    },
    [emit],
  );

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

  function toggleRtl() {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    if (editorRef.current) {
      editorRef.current.setAttribute('dir', next);
      emit();
    }
  }

  function handleImagePick(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 8 * 1024 * 1024) {
      window.alert('Please choose an image under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      insertHtml(snippetForBlock('image', url, imageAlign));
      setShowImageMenu(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[#E5E1D8] bg-white', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E5E1D8] bg-[#F7F6F2] px-2 py-1.5">
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
        <div className="relative">
          <button
            type="button"
            title="Insert image (left / center / right)"
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
            Image
          </button>
          {showImageMenu && (
            <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-[#E5E1D8] bg-white py-1 shadow-lg">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Placement
              </p>
              {(
                [
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setImageAlign(opt.id);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[#F7F6F2]',
                    imageAlign === opt.id ? 'bg-[#104C3B]/8 font-semibold text-[#104C3B]' : 'text-[#0B1B2B]',
                  )}
                >
                  <opt.icon size={14} />
                  {opt.label}
                </button>
              ))}
              <div className="my-1 border-t border-[#E5E1D8]" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  imageInputRef.current?.click();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[#104C3B] hover:bg-[#F7F6F2]"
              >
                <ImagePlus size={14} />
                Upload image…
              </button>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              handleImagePick(e.target.files?.[0]);
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

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        onInput={emit}
        onPaste={handlePaste}
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
          '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md',
          '[&_figure.content-image]:my-4 [&_figure.content-image]:block',
          '[&_figure.content-image figcaption]:mt-1.5 [&_figure.content-image figcaption]:text-center [&_figure.content-image figcaption]:text-[12px] [&_figure.content-image figcaption]:text-[#64748B]',
          '[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#E5E1D8] [&_td]:p-2',
        )}
      />
    </div>
  );
}
