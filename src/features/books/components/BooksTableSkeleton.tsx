export function BooksTableSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-[#E5E1D8] px-5 py-3 last:border-b-0"
        >
          <div className="h-11 w-8 shrink-0 rounded bg-[#E5E1D8]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-48 max-w-full rounded bg-[#E5E1D8]" />
            <div className="h-3 w-28 rounded bg-[#F1F0EB]" />
          </div>
          <div className="hidden h-3 w-24 rounded bg-[#E5E1D8] sm:block" />
          <div className="hidden h-5 w-20 rounded-md bg-[#E5E1D8] md:block" />
          <div className="h-5 w-16 rounded-full bg-[#E5E1D8]" />
          <div className="hidden h-3 w-16 rounded bg-[#E5E1D8] lg:block" />
          <div className="h-8 w-8 shrink-0 rounded-lg bg-[#F1F0EB]" />
        </div>
      ))}
    </div>
  );
}
