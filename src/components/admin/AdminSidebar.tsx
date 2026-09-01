import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Tag,
  Upload,
  Settings,
  X,
  BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Navigation config ────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Library',
    items: [
      { label: 'Books',      href: '/admin/books',    icon: BookOpen },
      { label: 'Scholars',   href: '/admin/scholars', icon: GraduationCap },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Import Book', href: '/admin/books/import', icon: Upload },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

// ─── Single nav item ──────────────────────────────────────────────────────────
function SidebarNavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const location = useLocation();
  // Exact match for /admin, prefix match for sub-routes
  const isActive =
    item.href === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      )}
    >
      {/* Gold left bar for active item */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#C9A646]" />
      )}
      <item.icon
        size={16}
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-[#C9A646]' : 'text-slate-500 group-hover:text-slate-300'
        )}
      />
      <span>{item.label}</span>
    </NavLink>
  );
}

// ─── Sidebar content (shared between desktop + mobile) ───────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#0B1B2B]">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#C9A646]/20">
            <BookMarked size={16} className="text-[#C9A646]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight text-white">
              Islamic Digital Library
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#C9A646]/70">
              Admin Panel
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {navigation.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} onClick={onClose} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom profile area */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A646]/20 text-[13px] font-bold text-[#C9A646]">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">Admin</p>
            <p className="truncate text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop — fixed sidebar, outside document flow */}
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-[250px] overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile — drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-[250px] lg:hidden"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
