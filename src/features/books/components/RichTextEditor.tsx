/**
 * RichTextEditor — uses the browser's built-in contentEditable + execCommand API.
 * No external dependency. Outputs HTML string.
 * Architecture is ready to be swapped for a proper editor (TipTap, Slate, etc.) later.
 */
import { useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, List, ListOrdered, Quote,
  Heading2, Heading3, AlignLeft, AlignCenter, Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  command: string;
  value?: string;
  title: string;
}

const TOOLBAR: (ToolbarButton | 'sep')[] = [
  { icon: Bold,        command: 'bold',                title: 'Bold' },
  { icon: Italic,      command: 'italic',              title: 'Italic' },
  'sep',
  { icon: Heading2,    command: 'formatBlock', value: 'h2', title: 'Heading 2' },
  { icon: Heading3,    command: 'formatBlock', value: 'h3', title: 'Heading 3' },
  'sep',
  { icon: List,        command: 'insertUnorderedList', title: 'Bullet list' },
  { icon: ListOrdered, command: 'insertOrderedList',   title: 'Numbered list' },
  { icon: Quote,       command: 'formatBlock', value: 'blockquote', title: 'Blockquote' },
  'sep',
  { icon: AlignLeft,   command: 'justifyLeft',         title: 'Align left' },
  { icon: AlignCenter, command: 'justifyCenter',       title: 'Align center' },
  'sep',
  { icon: LinkIcon,    command: 'createLink',          title: 'Insert link' },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '200px',
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track if we've initialised to avoid cursor-jump on re-render
  const initialised = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialised.current) {
      editorRef.current.innerHTML = value;
      initialised.current = true;
    }
  }, [value]);

  const exec = useCallback((command: string, value?: string) => {
    if (command === 'createLink') {
      const url = window.prompt('Enter URL:', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(command, false, value);
    }
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  }, [onChange]);

  return (
    <div className={cn('rounded-lg border border-[#E5E1D8] bg-white overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E5E1D8] bg-[#F7F6F2] px-2 py-1.5">
        {TOOLBAR.map((item, i) =>
          item === 'sep' ? (
            <span key={`sep-${i}`} className="mx-1 h-4 w-px bg-[#E5E1D8]" />
          ) : (
            <button
              key={item.command + (item.value ?? '')}
              type="button"
              title={item.title}
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus in editor
                exec(item.command, item.value);
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#E5E1D8] hover:text-[#0B1B2B]"
            >
              <item.icon size={14} />
            </button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={cn(
          'px-4 py-3 text-[14px] text-[#0B1B2B] leading-relaxed outline-none',
          'prose prose-sm max-w-none',
          // placeholder via CSS
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#94A3B8]',
          // heading styles inside editor
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A646] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#64748B] [&_blockquote]:my-3',
          '[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5',
          '[&_p]:my-1.5',
          '[&_a]:text-[#C9A646] [&_a]:underline'
        )}
      />
    </div>
  );
}
