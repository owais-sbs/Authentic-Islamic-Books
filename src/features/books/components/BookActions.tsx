import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  ClipboardCheck,
  Pencil,
  Eye,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import {
  archiveAdminBook,
  deleteAdminBook,
  getBookPreviewSlug,
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
    await new Promise((r) => setTimeout(r, 600));
    await deleteAdminBook(book.id);
    await showDeleteSuccess(book.title);
    onActionComplete?.();
  }

  async function handleArchive() {
    setOpen(false);
    const ok = await confirmArchiveBook(book.title);
    if (!ok) return;

    setExiting(true);
    await new Promise((r) => setTimeout(r, 600));
    await archiveAdminBook(book.id);
    await showArchiveSuccess(book.title);
    onActionComplete?.();
  }

  async function handleRestore() {
    setOpen(false);
    await restoreAdminBook(book.id);
    onActionComplete?.();
  }

  function handlePreview() {
    setOpen(false);
    const slug = getBookPreviewSlug(book.id, book.title);
    window.open(`/books/${slug}`, '_blank');
  }

  function handleEdit() {
    setOpen(false);
    navigate(`/admin/books/${book.id}/review`);
  }

  const actions = [
    ...(book.status === 'needs_review' || book.status === 'processing'
      ? [{ label: 'Review', icon: ClipboardCheck, onClick: handleEdit }]
      : []),
    { label: 'Edit', icon: Pencil, onClick: handleEdit },
    { label: 'Preview', icon: Eye, onClick: handlePreview },
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
          ? { opacity: 0, x: 40, scale: 0.92, filter: 'blur(2px)' }
          : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }
      }
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
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
                onClick={() => void a.onClick()}
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
    </motion.div>
  );
}
