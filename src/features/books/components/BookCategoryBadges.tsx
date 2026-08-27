interface BookCategoryBadgesProps {
  categories: string[];
  max?: number;
}

export function BookCategoryBadges({ categories, max = 2 }: BookCategoryBadgesProps) {
  const visible = categories.slice(0, max);
  const overflow = categories.length - max;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center rounded-md bg-[#F7F6F2] px-2 py-0.5 text-[11px] font-medium text-[#64748B] border border-[#E5E1D8] whitespace-nowrap"
        >
          {cat}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-md bg-[#F7F6F2] px-2 py-0.5 text-[11px] text-[#94A3B8] border border-[#E5E1D8]">
          +{overflow}
        </span>
      )}
    </div>
  );
}
