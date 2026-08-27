import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RecentBook {
  id: number;
  title: string;
  author: string;
  status: 'Published' | 'Draft';
  created: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RecentBook['status'] }) {
  return (
    <span
      className={
        status === 'Published'
          ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200'
      }
    >
      {status}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface RecentBooksTableProps {
  books: RecentBook[];
}

export function RecentBooksTable({ books }: RecentBooksTableProps) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm">
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-[#E5E1D8] px-5 py-4">
        <h3 className="text-[15px] font-semibold text-[#0B1B2B]">Recent Books</h3>
        <Link
          to="/admin/books"
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#C9A646] transition-colors hover:text-[#a8873a]"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E1D8] bg-[#F7F6F2]">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Book
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Author
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8]">
            {books.map((book) => (
              <tr
                key={book.id}
                className="transition-colors hover:bg-[#F7F6F2]"
              >
                <td className="px-5 py-3.5">
                  <span className="font-medium text-[#0B1B2B]">{book.title}</span>
                </td>
                <td className="px-4 py-3.5 text-[#64748B]">{book.author}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={book.status} />
                </td>
                <td className="px-4 py-3.5 text-[#64748B]">{book.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <ul className="divide-y divide-[#E5E1D8] sm:hidden">
        {books.map((book) => (
          <li key={book.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#0B1B2B]">{book.title}</p>
              <p className="mt-0.5 text-[12px] text-[#64748B]">{book.author}</p>
              <p className="mt-0.5 text-[11px] text-[#64748B]">{book.created}</p>
            </div>
            <div className="shrink-0 pt-0.5">
              <StatusBadge status={book.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
