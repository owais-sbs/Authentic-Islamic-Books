import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { confirmCreateNewBook } from '@/lib/swal';

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  confirmBeforeNavigate?: boolean;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  confirmBeforeNavigate = false,
}: QuickActionCardProps) {
  const navigate = useNavigate();

  async function handleClick(event: React.MouseEvent) {
    if (!confirmBeforeNavigate) return;
    event.preventDefault();
    const ok = await confirmCreateNewBook();
    if (ok) navigate(href);
  }

  return (
    <Link
      to={href}
      onClick={(event) => void handleClick(event)}
      className="group flex flex-col gap-3 rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm transition-all duration-150 hover:border-[#1B4F72]/40 hover:shadow-md glossy-card"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100/70">
        <Icon size={18} className="text-[#1B4F72]" />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-[#0B1B2B]">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#1B4F72] transition-colors group-hover:text-[#154060]">
        Get started <ArrowRight size={13} />
      </div>
    </Link>
  );
}
