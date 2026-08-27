import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-3 rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm transition-all duration-150 hover:border-[#C9A646]/40 hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A646]/10 transition-colors group-hover:bg-[#C9A646]/15">
        <Icon size={18} className="text-[#C9A646]" />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-[#0B1B2B]">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-[12px] font-medium text-[#C9A646] transition-colors group-hover:text-[#a8873a]">
        Get started <ArrowRight size={13} />
      </div>
    </Link>
  );
}
