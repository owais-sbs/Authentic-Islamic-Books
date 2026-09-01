import { useState } from 'react';
import { BookOpen, Globe, Lock, Database, ExternalLink, Check, Copy } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { isSupabaseConfigured } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

// ─── Setting card ─────────────────────────────────────────────────────────────
function SettingCard({ icon: Icon, title, description, children }: SettingCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7F6F2] mt-0.5">
          <Icon size={18} className="text-[#64748B]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#0B1B2B]">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B] max-w-sm">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:pt-0.5">{children}</div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ ok, labels }: { ok: boolean; labels: [string, string] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
      ok
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-slate-100 text-[#64748B] border border-[#E5E1D8]'
    }`}>
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-[#94A3B8]'}`} />
      {ok ? labels[0] : labels[1]}
    </span>
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
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          placeholder={placeholder}
          className="w-56 rounded-lg border border-[#C9A646]/40 bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
        />
        <button
          onClick={save}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A646] text-[#0B1B2B] transition-colors hover:bg-[#b8933d]"
        >
          <Check size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="group flex items-center gap-2 rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2 text-[13px] text-[#0B1B2B] transition-colors hover:border-[#C9A646]/40 hover:bg-white"
    >
      <span className="font-medium">{value}</span>
      <span className="text-[11px] text-[#94A3B8] group-hover:text-[#C9A646] transition-colors">Edit</span>
    </button>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] text-[#94A3B8] transition-colors hover:text-[#C9A646]"
    >
      {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const supabaseOk = isSupabaseConfigured();
  const [libraryName, setLibraryName] = useState('Authentic Islamic Books');
  const [publicUrl, setPublicUrl] = useState('https://www.authenticislamicbooks.com');

  return (
    <AdminShell pageTitle="Settings">
      <div className="space-y-6">
        <AdminPageHeader
          title="Settings"
          description="System configuration for the Islamic Digital Library admin panel."
        />

        {/* ── General ──────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
            General
          </p>
          <div className="space-y-3">
            <SettingCard
              icon={BookOpen}
              title="Library Name"
              description="The name displayed in the public-facing library and the admin header."
            >
              <EditableField value={libraryName} onChange={setLibraryName} placeholder="Library name" />
            </SettingCard>

            <SettingCard
              icon={Globe}
              title="Public Library URL"
              description="The base URL of the public-facing website used for preview links."
            >
              <div className="flex flex-col items-end gap-2">
                <EditableField value={publicUrl} onChange={setPublicUrl} placeholder="https://..." />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[12px] font-medium text-[#C9A646] transition-colors hover:text-[#b8933d]"
                >
                  Open site <ExternalLink size={12} />
                </a>
              </div>
            </SettingCard>
          </div>
        </section>

        {/* ── Infrastructure ────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
            Infrastructure
          </p>
          <div className="space-y-3">
            <SettingCard
              icon={Database}
              title="Supabase Database"
              description="Books, chapters, and sections are stored in Supabase when configured. Without it, data lives in localStorage only."
            >
              <StatusBadge ok={supabaseOk} labels={['Connected', 'Not configured']} />
            </SettingCard>

            <SettingCard
              icon={Lock}
              title="Authentication"
              description="Admin access is protected by Supabase Auth. Configure auth providers in your Supabase project dashboard."
            >
              <StatusBadge ok={supabaseOk} labels={['Enabled', 'Local only']} />
            </SettingCard>
          </div>
        </section>

        {/* ── Env setup guide (only shown when Supabase not configured) ─────── */}
        {!supabaseOk && (
          <section>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              Setup Guide
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-[13px] font-semibold text-amber-900 mb-1">
                Connect Supabase to enable cloud sync
              </p>
              <p className="text-[12px] text-amber-700 mb-4">
                Add these to your <code className="rounded bg-amber-100 px-1 font-mono">.env</code> file at the project root, then restart the dev server.
              </p>
              <div className="rounded-lg bg-[#0B1B2B] px-4 py-4 font-mono text-[12px] text-slate-200 relative">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      <span className="text-[#C9A646]">VITE_SUPABASE_URL</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-emerald-300">https://your-project.supabase.co</span>
                    </span>
                    <CopyButton text="VITE_SUPABASE_URL=https://your-project.supabase.co" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      <span className="text-[#C9A646]">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-emerald-300">your-anon-key-here</span>
                    </span>
                    <CopyButton text="VITE_SUPABASE_ANON_KEY=your-anon-key-here" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-amber-600">
                Find your keys in the Supabase dashboard → Settings → API.
              </p>
            </div>
          </section>
        )}

        <p className="text-center text-[12px] text-[#94A3B8]">
          Additional settings — language, themes, reading preferences — coming in a future update.
        </p>
      </div>
    </AdminShell>
  );
}
