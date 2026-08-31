import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  pageTitle: string;
  onMobileMenuOpen: () => void;
}

export function AdminHeader({ pageTitle, onMobileMenuOpen }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E1D8] bg-[#F7F6F2] px-4 sm:px-6">
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

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#EDEAE3]"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-medium leading-tight text-[#0B1B2B] capitalize">{displayName}</p>
            <p className="text-[11px] text-[#64748B] truncate max-w-[160px]">{user?.email}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A646]/15 text-[13px] font-bold text-[#C9A646]">
            {initial}
          </div>
          <ChevronDown size={14} className="text-[#94A3B8] hidden sm:block" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#E5E1D8] bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void handleLogout();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
