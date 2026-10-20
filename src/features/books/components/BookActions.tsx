import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import {
  archiveAdminBook,
  deleteAdminBook,
  restoreAdminBook,
} from '@/lib/adminBookActions';
import {
  confirmArchiveBook,
  confirmDeleteBook,
  showArchiveSuccess,
  showDeleteSuccess,
} from '@/lib/swal';
import type { Book } from '../types';

interface BookActionsProps {
  book: Book;
  onActionComplete?: () => void;
}

export function BookActions({ book, onActionComplete }: BookActionsProps) {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isArchived = book.status === 'archived';

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function handleDelete() {
    setOpen(false);
    const ok = await confirmDeleteBook(book.title);
    if (!ok) return;

    setExiting(true);
    await new Promise((r) => setTimeout(r, 400));
    await deleteAdminBook(book.id);
    const next = await showDeleteSuccess(book.title);
    onActionComplete?.();
    if (next === 'list') navigate('/admin/books');
  }

  async function handleArchive() {
    setOpen(false);
    const ok = await confirmArchiveBook(book.title);
    if (!ok) return;

    setExiting(true);
    await new Promise((r) => setTimeout(r, 400));
    await archiveAdminBook(book.id);
    await showArchiveSuccess(book.title);
    onActionComplete?.();
  }

  async function handleRestore() {
    setOpen(false);
    await restoreAdminBook(book.id);
    onActionComplete?.();
  }

  function handleEdit() {
    setOpen(false);
    navigate(`/admin/books/${book.id}/review`);
  }

  const actions: Array<{
    label: string;
    icon: typeof Pencil;
    onClick: () => void | Promise<void>;
    danger?: boolean;
    separator?: boolean;
  }> = [
    { label: 'Edit', icon: Pencil, onClick: handleEdit },
    ...(isArchived
      ? [{ label: 'Restore', icon: ArchiveRestore, onClick: handleRestore, separator: true }]
      : [{ label: 'Archive', icon: Archive, onClick: handleArchive, separator: true }]),
    { label: 'Delete', icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <motion.div
      ref={ref}
      className="relative"
      animate={
        exiting
          ? { opacity: 0, x: 24, scale: 0.96 }
          : { opacity: 1, x: 0, scale: 1 }
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F0EB] hover:text-[#0B1B2B]"
        aria-label="Book actions"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-[#E5E1D8] bg-white py-1 shadow-lg">
          {actions.map((a) => (
            <div key={a.label}>
              {a.separator && <div className="my-1 border-t border-[#E5E1D8]" />}
              <button
                type="button"
                onClick={() => void a.onClick()}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${
                  a.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-[#0B1B2B] hover:bg-[#F7F6F2]'
                }`}
              >
                <a.icon size={14} className="shrink-0" />
                {a.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
