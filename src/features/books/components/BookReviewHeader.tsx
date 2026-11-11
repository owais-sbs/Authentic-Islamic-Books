import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, RefreshCw, Archive } from 'lucide-react';
import { BookStatusBadge } from './BookStatusBadge';
import type { BookStatus } from '../types';
import { cn } from '@/lib/utils';

interface BookReviewHeaderProps {
  title: string;
  status: BookStatus;
  isDirty: boolean;
  isNewBook?: boolean;
  isSaving?: boolean;
  canReprocess?: boolean;
  isReprocessing?: boolean;
  onSaveDraft: () => void;
  onApprove: () => void;
  onUnpublish?: () => void;
  onPreview: () => void;
  onReprocess?: () => void;
}

export function BookReviewHeader({
  title,
  status,
  isDirty,
  isNewBook,
  isSaving,
  canReprocess,
  isReprocessing,
  onSaveDraft,
  onApprove,
  onUnpublish,
  onPreview,
  onReprocess,
}: BookReviewHeaderProps) {
  const published = status === 'published';

  return (
    <div className="sticky top-14 z-20 border-b border-[#E5E1D8] bg-[#F7F6F2]/95 backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/admin/books"
            className="flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-md text-[13px] text-[#64748B] transition-colors hover:bg-white hover:text-[#0B1B2B] sm:h-auto sm:w-auto sm:justify-start"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Books</span>
          </Link>
          <span className="hidden text-[#E5E1D8] sm:inline">/</span>
          <h1 className="min-w-0 truncate text-[13px] font-semibold text-[#0B1B2B] sm:text-[14px]">
            {title || (isNewBook ? 'New Book' : 'Edit Book')}
          </h1>
          <BookStatusBadge status={status} className="hidden shrink-0 sm:inline-flex" />
          {isDirty && (
            <span className="hidden shrink-0 text-[11px] text-[#94A3B8] sm:block">
              • Unsaved changes
            </span>
          )}
        </div>

        <div className="-mx-1 flex flex-wrap items-center gap-1.5 overflow-x-auto px-1 sm:gap-2">
          {canReprocess && onReprocess && (
            <button
              type="button"
              onClick={onReprocess}
              disabled={isSaving || isReprocessing}
              title="Dry-run extraction preview. Nothing is saved until you apply."
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-2.5 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2] hover:text-[#0B1B2B] disabled:opacity-50 sm:px-3 sm:text-[13px]"
            >
              <RefreshCw size={14} className={cn(isReprocessing && 'animate-spin')} />
              <span className="hidden min-[400px]:inline">
                {isReprocessing ? 'Validating…' : 'Validate PDF'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onPreview}
            disabled={isSaving || isReprocessing}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-2.5 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2] hover:text-[#0B1B2B] disabled:opacity-50 sm:px-3 sm:text-[13px]"
          >
            <Eye size={14} />
            <span className="hidden min-[400px]:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isReprocessing}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-2.5 py-2 text-[12px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2] disabled:opacity-50 sm:px-3 sm:text-[13px]"
          >
            <Save size={14} />
            <span className="hidden min-[360px]:inline">{isSaving ? 'Saving…' : 'Save Draft'}</span>
            <span className="min-[360px]:hidden">{isSaving ? '…' : 'Save'}</span>
          </button>
          {published && onUnpublish && (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isSaving || isReprocessing}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-[12px] font-medium text-amber-900 transition-colors hover:bg-amber-50 disabled:opacity-50 sm:px-3 sm:text-[13px]"
            >
              <Archive size={14} />
              <span className="hidden min-[400px]:inline">Unpublish</span>
            </button>
          )}
          {!published && (
            <button
              type="button"
              onClick={onApprove}
              disabled={isSaving || isReprocessing}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#C9A646] px-2.5 py-2 text-[12px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-50 sm:px-3 sm:text-[13px]"
            >
              <Send size={14} />
              {isSaving ? 'Publishing…' : 'Publish'}
            </button>
          )}
          {published && (
            <button
              type="button"
              onClick={onApprove}
              disabled={isSaving || isReprocessing}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#C9A646] px-2.5 py-2 text-[12px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-50 sm:px-3 sm:text-[13px]"
            >
              <Send size={14} />
              <span className="hidden min-[400px]:inline">{isSaving ? 'Saving…' : 'Update live'}</span>
              <span className="min-[400px]:hidden">{isSaving ? '…' : 'Update'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
