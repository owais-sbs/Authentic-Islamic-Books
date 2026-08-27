import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ClipboardCheck, Pencil, Eye, Copy, Archive, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

interface BookActionsProps {
  book: Book;
}

export function BookActions({ book }: BookActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const actions = [
    ...(book.status === 'needs_review' || book.status === 'processing'
      ? [{ label: 'Review', icon: ClipboardCheck, onClick: () => navigate(`/admin/books/${book.id}/review`) }]
      : []),
    { label: 'Edit', icon: Pencil, onClick: () => navigate(`/admin/books/${book.id}/review`) },
    { label: 'Preview', icon: Eye, onClick: () => {} },
    { label: 'Duplicate', icon: Copy, onClick: () => {} },
    { label: 'Archive', icon: Archive, onClick: () => {}, separator: true },
    { label: 'Delete', icon: Trash2, onClick: () => {}, danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#F1F0EB] hover:text-[#0B1B2B]"
        aria-label="Book actions"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#E5E1D8] bg-white py-1 shadow-lg">
          {actions.map((a) => (
            <div key={a.label}>
              {a.separator && <div className="my-1 border-t border-[#E5E1D8]" />}
              <button
                onClick={() => { a.onClick(); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${
                  a.danger ? 'text-red-600 hover:bg-red-50' : 'text-[#0B1B2B] hover:bg-[#F7F6F2]'
                }`}
              >
                <a.icon size={13} className="shrink-0" />
                {a.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
