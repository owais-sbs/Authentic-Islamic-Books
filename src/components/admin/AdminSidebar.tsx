import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Tag,
  Upload,
  PenLine,
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
      { label: 'Books', href: '/admin/books', icon: BookOpen },
      { label: 'Scholars', href: '/admin/scholars', icon: GraduationCap },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Manual Book Creation', href: '/admin/books/manual', icon: PenLine },
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

export const ADMIN_SIDEBAR_EXPANDED = 250;
export const ADMIN_SIDEBAR_COLLAPSED = 72;

// ─── Single nav item ──────────────────────────────────────────────────────────
function SidebarNavItem({
  item,
  onClick,
  collapsed,
}: {
  item: NavItem;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const isActive =
    item.href === '/admin'
      ? location.pathname === '/admin'
      : item.href === '/admin/books'
        ? location.pathname === '/admin/books'
        : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center px-2' : 'gap-3 px-3',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
      )}
      <item.icon
        size={16}
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300',
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

// ─── Sidebar content (shared between desktop + mobile) ───────────────────────
function SidebarContent({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0B1B2B]">
      {/* Brand */}
      <div
        className={cn(
          'flex items-center border-b border-white/10 py-5',
          collapsed ? 'justify-center px-2' : 'justify-between px-5',
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B4F72] text-white shadow-sm">
            <BookMarked size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-tight text-white tracking-tight">
                Authentic Islamic Books
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                Admin Panel
              </p>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className={cn('flex-1 overflow-y-auto py-4 scrollbar-hide', collapsed ? 'px-2' : 'px-3')}>
        {navigation.map((group) => (
          <div key={group.group} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} onClick={onClose} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom profile area */}
      <div className={cn('border-t border-white/10 py-4', collapsed ? 'px-2' : 'px-4')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B4F72] text-[13px] font-bold text-white shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">Admin</p>
              <p className="truncate text-[11px] text-slate-500">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const desktopWidth = collapsed ? ADMIN_SIDEBAR_COLLAPSED : ADMIN_SIDEBAR_EXPANDED;

  return (
    <>
      {/* Desktop — fixed sidebar, outside document flow */}
      <aside className="hidden lg:block">
        <div
          className="fixed inset-y-0 left-0 overflow-hidden transition-[width] duration-200 ease-out"
          style={{ width: desktopWidth }}
        >
          <SidebarContent
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
          />
        </div>
      </aside>

      {/* Mobile — drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] overflow-hidden shadow-xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
