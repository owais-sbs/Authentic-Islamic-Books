import { useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminShellProps {
  children: ReactNode;
  pageTitle: string;
}

export function AdminShell({ children, pageTitle }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Sidebar — fixed, outside flow */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main column — offset by sidebar width on desktop */}
      <div className="flex flex-col lg:pl-[250px]">
        <AdminHeader
          pageTitle={pageTitle}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
