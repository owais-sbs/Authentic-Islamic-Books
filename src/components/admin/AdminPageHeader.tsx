interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h2 className="text-xl font-bold text-[#0B1B2B] sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-[#64748B]">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
