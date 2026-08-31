import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';
import { BookStatusBadge } from './BookStatusBadge';
import type { BookStatus } from '../types';
import { cn } from '@/lib/utils';

interface BookReviewHeaderProps {
  title: string;
  status: BookStatus;
  isDirty: boolean;
  isNewBook?: boolean;
  isSaving?: boolean;
  onSaveDraft: () => void;
  onApprove: () => void;
  onPreview: () => void;
}

export function BookReviewHeader({
  title,
  status,
  isDirty,
  isNewBook,
  isSaving,
  onSaveDraft,
  onApprove,
  onPreview,
}: BookReviewHeaderProps) {
  return (
    <div className="sticky top-14 z-20 border-b border-[#E5E1D8] bg-[#F7F6F2]">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/books"
            className="flex items-center gap-1.5 text-[13px] text-[#64748B] transition-colors hover:text-[#0B1B2B] shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Books</span>
          </Link>
          <span className="text-[#E5E1D8]">/</span>
          <h1 className="truncate text-[14px] font-semibold text-[#0B1B2B]">
            {title || (isNewBook ? 'New Book' : 'Edit Book')}
          </h1>
          <BookStatusBadge status={status} className="hidden sm:inline-flex shrink-0" />
          {isDirty && (
            <span className="hidden sm:block text-[11px] text-[#94A3B8] shrink-0">
              • Unsaved changes
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreview}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2] hover:text-[#0B1B2B] disabled:opacity-50"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2] disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A646] px-3 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-50"
          >
            <Send size={14} />
            {isSaving ? 'Publishing…' : 'Approve & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
