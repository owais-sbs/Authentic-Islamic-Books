import { useState } from 'react';
import { Tag, Plus, Pencil, X, Check, Trash2, RefreshCw } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useCategories, notifyCategoriesChanged } from '@/hooks/useCategories';
import { upsertCategoryToSupabase, deleteCategoryFromSupabase } from '@/lib/categoryApi';
import type { Category } from '@/types';

// ─── Inline edit row ──────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  onSave,
  onDelete,
}: {
  cat: Category;
  onSave: (patch: Partial<Category>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(cat.name);
  const [desc, setDesc] = useState(cat.description);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: desc.trim() });
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    setSaving(true);
    try {
      await onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(cat.name);
    setDesc(cat.description);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="bg-[#FAFAF8] px-5 py-4 border-b border-[#E5E1D8] last:border-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A646]/10 mt-1">
            <Tag size={16} className="text-[#C9A646]" />
          </div>
          <div className="flex-1 space-y-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name *"
              className="w-full rounded-lg border border-[#C9A646]/40 bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20 resize-none"
            />
          </div>
          <div className="flex items-center gap-2 sm:mt-1">
            <button
              onClick={() => void handleSave()}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#C9A646] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-50"
            >
              <Check size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-4 px-5 py-4 border-b border-[#E5E1D8] last:border-0 hover:bg-[#FAFAF8] transition-colors group">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A646]/10">
        <Tag size={16} className="text-[#C9A646]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#0B1B2B]">{cat.name}</p>
        <p className="text-[12px] text-[#64748B] line-clamp-1 mt-0.5">{cat.description || 'No description'}</p>
      </div>
      <span className="hidden md:inline-flex items-center rounded-md bg-[#F7F6F2] px-2.5 py-1 text-[11px] font-mono text-[#64748B] border border-[#E5E1D8]">
        {cat.slug}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#64748B] opacity-0 group-hover:opacity-100 transition-all hover:border-[#C9A646]/40 hover:text-[#C9A646]"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => void handleDelete()}
          title="Delete Category"
          className="flex items-center justify-center p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

// ─── Add category form ────────────────────────────────────────────────────────
function AddCategoryForm({
  onAdd,
  onCancel,
}: {
  onAdd: (c: Category) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newCat: Category = {
      id: `cat-${slug}-${Date.now()}`,
      slug,
      name: name.trim(),
      description: desc.trim(),
    };
    setSaving(true);
    try {
      await onAdd(newCat);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="bg-[#FAFAF8] border-b border-[#E5E1D8] px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A646]/10 mt-1">
          <Plus size={16} className="text-[#C9A646]" />
        </div>
        <div className="flex-1 space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name *"
            className="w-full rounded-lg border border-[#C9A646]/40 bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20 resize-none"
          />
        </div>
        <div className="flex items-center gap-2 sm:mt-1">
          <button
            onClick={() => void handleAdd()}
            disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A646] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d] disabled:opacity-40"
          >
            <Check size={13} /> {saving ? 'Adding…' : 'Add'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]"
          >
            <X size={13} /> Cancel
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminCategoriesPage() {
  const { categories, loading, refreshCategories } = useCategories();
  const [adding, setAdding] = useState(false);

  async function handleSave(id: string, patch: Partial<Category>) {
    const existing = categories.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await upsertCategoryToSupabase(updated);
    notifyCategoriesChanged();
  }

  async function handleAdd(cat: Category) {
    await upsertCategoryToSupabase(cat);
    notifyCategoriesChanged();
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await deleteCategoryFromSupabase(id);
    notifyCategoriesChanged();
  }

  return (
    <AdminShell pageTitle="Categories">
      <div className="space-y-6">
        <AdminPageHeader
          title="Categories"
          description="Manage subject categories synced directly with your Supabase database."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refreshCategories()}
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
                  <Plus size={14} /> Add Category
                </button>
              )}
            </div>
          }
        />

        <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E1D8] bg-[#F7F6F2] px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {categories.length} categories
            </p>
          </div>
          <ul>
            {adding && (
              <AddCategoryForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
            )}
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                cat={cat}
                onSave={(patch) => handleSave(cat.id, patch)}
                onDelete={() => handleDelete(cat.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
