import { Link } from 'react-router-dom';
import { ArrowLeft, FileUp, PenLine } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';

/**
 * Entry screen for Add New Book — two clear creation methods.
 * Does not replace Import Book or the review workflow.
 */
export function AdminNewBookChoicePage() {
  return (
    <AdminShell pageTitle="Add New Book">
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <Link
            to="/admin/books"
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-[#64748B] transition-colors hover:text-[#0B1B2B]"
          >
            <ArrowLeft size={14} /> Back to Books
          </Link>
          <h2 className="text-xl font-bold text-[#0B1B2B] sm:text-2xl">Add New Book</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Choose how you want to create this book. Both methods publish to the same library.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/books/import"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1B4F72] hover:shadow-md glossy-card"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1B4F72] transition-colors group-hover:bg-[#1B4F72] group-hover:text-white">
              <FileUp size={20} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-base font-bold text-ink-900">Import Book (PDF)</h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-[#64748B]">
              Upload a PDF. Text, chapters, languages, and Arabic are extracted automatically —
              then review and publish.
            </p>
            <span className="mt-4 text-xs font-semibold text-[#1B4F72] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Existing PDF workflow →
            </span>
          </Link>

          <Link
            to="/admin/books/manual"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1B4F72] hover:shadow-md glossy-card"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1B4F72] transition-colors group-hover:bg-[#1B4F72] group-hover:text-white">
              <PenLine size={20} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-base font-bold text-ink-900">Create Book Manually</h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-[#64748B]">
              Enter details and write or paste content with rich formatting. Organize chapters, insert
              content blocks, audio, PDF, and images, then preview and publish.
            </p>
            <span className="mt-4 text-xs font-semibold text-[#1B4F72] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open manual editor →
            </span>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
