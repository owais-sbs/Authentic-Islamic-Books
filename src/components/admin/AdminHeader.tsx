import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  pageTitle: string;
  onMobileMenuOpen: () => void;
}

export function AdminHeader({ pageTitle, onMobileMenuOpen }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E1D8] bg-[#F7F6F2] px-4 sm:px-6">
      {/* Left: mobile menu button + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[15px] font-semibold text-[#0B1B2B]">{pageTitle}</h1>
      </div>

      {/* Right: admin profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium leading-tight text-[#0B1B2B]">Admin</p>
          <p className="text-[11px] text-[#64748B]">Administrator</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A646]/15 text-[13px] font-bold text-[#C9A646]">
          A
        </div>
      </div>
    </header>
  );
}
