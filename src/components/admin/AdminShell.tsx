import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

const SIDEBAR_COLLAPSED_KEY = 'idl-admin-sidebar-collapsed';

interface AdminShellProps {
  children: ReactNode;
  pageTitle: string;
}

export function AdminShell({ children, pageTitle }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const { user } = useAuth();
  const showLocalWarning = isSupabaseConfigured() && user?.mode === 'local';

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div
        className={`flex flex-col transition-[padding] duration-200 ease-out ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[250px]'
        }`}
      >
        <AdminHeader
          pageTitle={pageTitle}
          onMobileMenuOpen={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        {showLocalWarning && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900 sm:px-6">
            You are signed in <strong>locally only</strong> — books will not sync to other team members.
            Create the admin user in Supabase Auth, then{' '}
            <Link to="/admin/login" className="font-semibold underline">
              sign in again
            </Link>{' '}
            so the shared library works for everyone.
          </div>
        )}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
