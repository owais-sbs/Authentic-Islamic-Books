import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  supporting?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  href?: string;
}

export function DashboardStatCard({
  label,
  value,
  supporting,
  icon: Icon,
  iconColor = 'text-[#C9A646]',
  iconBg = 'bg-[#C9A646]/10',
  href,
}: DashboardStatCardProps) {
  const inner = (
    <>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#64748B]">{label}</p>
        <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#0B1B2B] tabular-nums">
          {value}
        </p>
        {supporting && (
          <p className="mt-1 text-[12px] text-[#64748B]">{supporting}</p>
        )}
      </div>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} transition-transform duration-300 group-hover:scale-105`}
      >
        <Icon size={18} className={iconColor} />
      </div>
    </>
  );

  const className =
    'group flex items-start justify-between gap-3 rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A646]/35 hover:shadow-md';

  if (href) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
