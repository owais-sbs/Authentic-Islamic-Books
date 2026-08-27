export function BooksTableSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-[#E5E1D8] px-5 py-3.5">
          <div className="h-12 w-9 shrink-0 rounded bg-[#E5E1D8]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-44 rounded bg-[#E5E1D8]" />
            <div className="h-3 w-28 rounded bg-[#F1F0EB]" />
          </div>
          <div className="h-3 w-24 rounded bg-[#E5E1D8]" />
          <div className="h-5 w-28 rounded-full bg-[#E5E1D8]" />
          <div className="h-3 w-20 rounded bg-[#E5E1D8]" />
          <div className="h-3 w-16 rounded bg-[#E5E1D8]" />
          <div className="h-5 w-20 rounded-full bg-[#E5E1D8]" />
          <div className="h-3 w-20 rounded bg-[#E5E1D8]" />
        </div>
      ))}
    </div>
  );
}
