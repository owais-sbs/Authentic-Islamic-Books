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
      <div className="mx-auto max-w-3xl space-y-6">
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
            className="group flex flex-col rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#C9A646] hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#0B1B2B] transition-colors group-hover:bg-[#C9A646]/20">
              <FileUp size={20} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-[#0B1B2B]">Import Book</h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#64748B]">
              Upload a PDF. Text, chapters, languages, and Arabic are extracted automatically —
              then review and publish.
            </p>
            <span className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#C9A646]">
              Existing PDF workflow →
            </span>
          </Link>

          <Link
            to="/admin/books/manual"
            className="group flex flex-col rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#104C3B] hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#0B1B2B] transition-colors group-hover:bg-[#104C3B]/15">
              <PenLine size={20} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-[#0B1B2B]">Create Book Manually</h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#64748B]">
              Enter details and write or paste content from Word or PDF. Organize chapters, insert
              scholarly blocks, images, then preview and publish.
            </p>
            <span className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#104C3B]">
              Open manual editor →
            </span>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
