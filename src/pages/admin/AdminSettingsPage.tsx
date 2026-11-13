import { useState } from 'react';
import { BookOpen, Globe, ExternalLink, Check } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

// ─── Setting card ─────────────────────────────────────────────────────────────
interface SettingCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingCard({ icon: Icon, title, description, children }: SettingCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#141414] px-5 py-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-6 glossy-card">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-[#1B4F72] dark:text-blue-300 mt-0.5">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-ink-900 dark:text-white">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B] dark:text-neutral-400 max-w-sm">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0 sm:pt-0.5">{children}</div>
    </div>
  );
}

// ─── Editable value field ─────────────────────────────────────────────────────
function EditableField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    onChange(draft.trim() || value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder={placeholder}
          className="w-56 rounded-lg border border-[#1B4F72] bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-[#1B4F72]/20"
        />
        <button
          onClick={save}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4F72] text-white transition-colors hover:bg-[#154060]"
        >
          <Check size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-neutral-900 px-3 py-2 text-[13px] text-ink-900 dark:text-white transition-colors hover:border-[#1B4F72]/40 hover:bg-white dark:hover:bg-neutral-800"
    >
      <span className="font-semibold">{value}</span>
      <span className="text-[11px] text-[#64748B] group-hover:text-[#1B4F72] transition-colors">Edit</span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const [libraryName, setLibraryName] = useState('Authentic Islamic Books');
  const [publicUrl, setPublicUrl] = useState('https://www.authenticislamicbooks.com');

  return (
    <AdminShell pageTitle="Settings">
      <div className="w-full space-y-6">
        <AdminPageHeader
          title="Settings"
          description="Manage library preferences, titles, and public configuration."
        />

        {/* ── General Configuration ────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#64748B] dark:text-neutral-400">
            General
          </p>
          <div className="space-y-3">
            <SettingCard
              icon={BookOpen}
              title="Library Name"
              description="The brand name displayed in the public-facing library and admin headers."
            >
              <EditableField value={libraryName} onChange={setLibraryName} placeholder="Library name" />
            </SettingCard>

            <SettingCard
              icon={Globe}
              title="Public Library URL"
              description="The base URL of the public-facing website used for preview and reading links."
            >
              <div className="flex flex-col items-end gap-2">
                <EditableField value={publicUrl} onChange={setPublicUrl} placeholder="https://..." />
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#1B4F72] dark:text-blue-400 transition-colors hover:text-[#154060]"
                >
                  Open site <ExternalLink size={12} />
                </a>
              </div>
            </SettingCard>
          </div>
        </section>

        <p className="text-center text-[12px] text-[#64748B] dark:text-neutral-500 pt-4">
          All settings are synced automatically across the application.
        </p>
      </div>
    </AdminShell>
  );
}
