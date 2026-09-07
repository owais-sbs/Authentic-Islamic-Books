import { useState } from 'react';
import { GraduationCap, Plus, Pencil, X, Check, Trash2, RefreshCw } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useScholars, notifyScholarsChanged } from '@/hooks/useScholars';
import { upsertScholarToSupabase, deleteScholarFromSupabase } from '@/lib/scholarApi';
import type { Scholar } from '@/types';

// ─── Inline edit row ──────────────────────────────────────────────────────────
function ScholarRow({
  scholar,
  onSave,
  onDelete,
}: {
  scholar: Scholar;
  onSave: (patch: Partial<Scholar>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(scholar.name);
  const [fullName, setFullName] = useState(scholar.fullName);
  const [bornHijri, setBornHijri] = useState(String(scholar.bornHijri));
  const [diedHijri, setDiedHijri] = useState(String(scholar.diedHijri));
  const [bornPlace, setBornPlace] = useState(scholar.bornPlace);
  const [shortBio, setShortBio] = useState(scholar.shortBio);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        fullName: fullName.trim(),
        bornHijri: Number(bornHijri) || scholar.bornHijri,
        diedHijri: Number(diedHijri) || scholar.diedHijri,
        bornPlace: bornPlace.trim(),
        shortBio: shortBio.trim(),
      });
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save scholar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete scholar "${scholar.name}"?`)) return;
    setSaving(true);
    try {
      await onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete scholar');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(scholar.name);
    setFullName(scholar.fullName);
    setBornHijri(String(scholar.bornHijri));
    setDiedHijri(String(scholar.diedHijri));
    setBornPlace(scholar.bornPlace);
    setShortBio(scholar.shortBio);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="bg-[#FAFAF8] px-5 py-5 border-b border-[#E5E1D8] last:border-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Name *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-[#C9A646]/40 bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Born (AH)</label>
            <input type="number" value={bornHijri} onChange={e => setBornHijri(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Died (AH)</label>
            <input type="number" value={diedHijri} onChange={e => setDiedHijri(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Born Place</label>
            <input value={bornPlace} onChange={e => setBornPlace(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Short Bio</label>
            <input value={shortBio} onChange={e => setShortBio(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => void handleSave()} disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A646] px-4 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-50">
            <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={handleCancel} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-4 py-2 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]">
            <X size={13} /> Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-4 px-5 py-4 border-b border-[#E5E1D8] last:border-0 hover:bg-[#FAFAF8] transition-colors group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A646]/10">
        <GraduationCap size={18} className="text-[#C9A646]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#0B1B2B] truncate">{scholar.name}</p>
        <p className="text-[12px] text-[#64748B] truncate">{scholar.fullName}</p>
        <p className="text-[11px] text-[#94A3B8] mt-0.5">
          {scholar.bornHijri}–{scholar.diedHijri} AH · {scholar.bornPlace || 'Unknown'}
        </p>
      </div>
      <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
        {scholar.categories.slice(0, 2).map(cat => (
          <span key={cat} className="rounded-md bg-[#F7F6F2] px-2 py-0.5 text-[11px] text-[#64748B] border border-[#E5E1D8]">
            {cat.replace('cat-', '')}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#64748B] opacity-0 group-hover:opacity-100 transition-all hover:border-[#C9A646]/40 hover:text-[#C9A646]"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => void handleDelete()}
          title="Delete Scholar"
          className="flex items-center justify-center p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

// ─── Add scholar form ─────────────────────────────────────────────────────────
function AddScholarForm({ onAdd, onCancel }: { onAdd: (s: Scholar) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [bornHijri, setBornHijri] = useState('');
  const [diedHijri, setDiedHijri] = useState('');
  const [bornPlace, setBornPlace] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newScholar: Scholar = {
      id: `scholar-${slug}-${Date.now()}`,
      slug,
      name: name.trim(),
      fullName: fullName.trim() || name.trim(),
      bornHijri: Number(bornHijri) || 0,
      diedHijri: Number(diedHijri) || 0,
      bornPlace: bornPlace.trim(),
      shortBio: shortBio.trim(),
      fullBio: '',
      categories: [],
      imageUrl: '',
      timelineEvents: [],
    };
    setSaving(true);
    try {
      await onAdd(newScholar);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add scholar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="bg-[#FAFAF8] px-5 py-5 border-b border-[#E5E1D8]">
      <p className="text-[13px] font-semibold text-[#0B1B2B] mb-3">New Scholar</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: 'Name *', value: name, setter: setName, required: true },
          { label: 'Full Name', value: fullName, setter: setFullName },
          { label: 'Born (AH)', value: bornHijri, setter: setBornHijri, type: 'number' },
          { label: 'Died (AH)', value: diedHijri, setter: setDiedHijri, type: 'number' },
          { label: 'Born Place', value: bornPlace, setter: setBornPlace },
          { label: 'Short Bio', value: shortBio, setter: setShortBio },
        ].map(({ label, value, setter, type, required }) => (
          <div key={label} className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">{label}</label>
            <input
              autoFocus={required}
              type={type ?? 'text'}
              value={value}
              onChange={e => setter(e.target.value)}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => void handleAdd()} disabled={saving || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[#C9A646] px-4 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-40">
          <Check size={13} /> {saving ? 'Adding…' : 'Add Scholar'}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-4 py-2 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]">
          <X size={13} /> Cancel
        </button>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminScholarsPage() {
  const { scholars, loading, refreshScholars } = useScholars();
  const [adding, setAdding] = useState(false);

  async function handleSave(id: string, patch: Partial<Scholar>) {
    const existing = scholars.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await upsertScholarToSupabase(updated);
    notifyScholarsChanged();
  }

  async function handleAdd(scholar: Scholar) {
    await upsertScholarToSupabase(scholar);
    notifyScholarsChanged();
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await deleteScholarFromSupabase(id);
    notifyScholarsChanged();
  }

  return (
    <AdminShell pageTitle="Scholars">
      <div className="space-y-6">
        <AdminPageHeader
          title="Scholars"
          description="Manage scholar profiles synced directly with your Supabase database."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refreshScholars()}
                className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              {!adding && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C9A646] px-4 py-2.5 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d]"
                >
                  <Plus size={14} /> Add Scholar
                </button>
              )}
            </div>
          }
        />

        <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E1D8] bg-[#F7F6F2] px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {scholars.length} scholars in the library
            </p>
          </div>
          <ul>
            {adding && <AddScholarForm onAdd={handleAdd} onCancel={() => setAdding(false)} />}
            {scholars.map(scholar => (
              <ScholarRow
                key={scholar.id}
                scholar={scholar}
                onSave={patch => handleSave(scholar.id, patch)}
                onDelete={() => handleDelete(scholar.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
