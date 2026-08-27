import type { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  supporting?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function DashboardStatCard({
  label,
  value,
  supporting,
  icon: Icon,
  iconColor = 'text-[#C9A646]',
  iconBg = 'bg-[#C9A646]/10',
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#64748B]">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#0B1B2B]">
            {value}
          </p>
          {supporting && (
            <p className="mt-1 text-[12px] text-[#64748B]">{supporting}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
