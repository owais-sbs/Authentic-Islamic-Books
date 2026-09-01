/**
 * swal.ts — lightweight toast/confirm helpers using native browser APIs.
 * No external dependency. Styled to match the admin theme.
 * Replaces sweetalert2 to avoid an extra install.
 */

// ─── Toast notification ───────────────────────────────────────────────────────

function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' = 'success',
  duration = 2200
): void {
  // Remove any existing toast
  document.getElementById('idl-toast')?.remove();

  const colors = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✓' },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '✕' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', icon: '!' },
  };
  const c = colors[type];

  const toast = document.createElement('div');
  toast.id = 'idl-toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    display:flex; align-items:center; gap:10px;
    background:${c.bg}; border:1px solid ${c.border}; border-radius:10px;
    padding:12px 16px; box-shadow:0 4px 16px rgba(0,0,0,0.10);
    font-family:Inter,system-ui,sans-serif; font-size:13px; color:${c.text};
    max-width:340px; animation:idl-fadein 0.2s ease;
  `;
  toast.innerHTML = `
    <span style="font-size:15px;font-weight:700">${c.icon}</span>
    <span style="flex:1">${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="
      background:none;border:none;cursor:pointer;color:${c.text};
      font-size:16px;line-height:1;padding:0 2px;opacity:.6
    ">×</button>
    <style>@keyframes idl-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}</style>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function showConfirm(options: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmDanger?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    document.getElementById('idl-confirm')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'idl-confirm';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9998;
      background:rgba(0,0,0,.45);display:flex;
      align-items:center;justify-content:center;padding:16px;
    `;

    const confirmColor = options.confirmDanger ? '#dc2626' : '#C9A646';
    const confirmTextColor = options.confirmDanger ? '#fff' : '#0B1B2B';

    overlay.innerHTML = `
      <div style="
        background:#fff;border-radius:14px;padding:28px 28px 24px;
        max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.18);
        font-family:Inter,system-ui,sans-serif;
      ">
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0B1B2B">
          ${escapeHtml(options.title)}
        </h3>
        <p style="margin:0 0 20px;font-size:13px;color:#64748B;line-height:1.6">
          ${options.body}
        </p>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="idl-cancel" style="
            padding:8px 16px;border-radius:8px;border:1px solid #E5E1D8;
            background:#fff;color:#0B1B2B;font-size:13px;font-weight:500;
            cursor:pointer;font-family:inherit
          ">${escapeHtml(options.cancelLabel ?? 'Cancel')}</button>
          <button id="idl-confirm-btn" style="
            padding:8px 16px;border-radius:8px;border:none;
            background:${confirmColor};color:${confirmTextColor};
            font-size:13px;font-weight:600;cursor:pointer;font-family:inherit
          ">${escapeHtml(options.confirmLabel)}</button>
        </div>
      </div>
    `;

    function cleanup(result: boolean) {
      overlay.remove();
      resolve(result);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
    overlay.querySelector('#idl-cancel')?.addEventListener('click', () => cleanup(false));
    overlay.querySelector('#idl-confirm-btn')?.addEventListener('click', () => cleanup(true));

    document.body.appendChild(overlay);
  });
}

// ─── Public API (matches original sweetalert2 signatures) ────────────────────

export async function confirmCreateNewBook(): Promise<boolean> {
  return showConfirm({
    title: 'Create a new book?',
    body: 'You will add the title, chapters, and content. Save as draft anytime, or publish when the book is ready for readers.',
    confirmLabel: 'Start new book',
    cancelLabel: 'Cancel',
  });
}

export async function showNewBookWelcome(): Promise<void> {
  await showConfirm({
    title: 'New book started',
    body: 'Add the book details below. You can import a PDF, write chapters manually, then save as draft or publish to the library.',
    confirmLabel: 'Got it',
    cancelLabel: 'Close',
  });
}

export async function showBookSavedSuccess(
  title: string,
  mode: 'draft' | 'published'
): Promise<'add-another' | 'go-to-list'> {
  const label = mode === 'published' ? 'published to the library' : 'saved as a draft';
  const result = await showConfirm({
    title: mode === 'published' ? 'Book Published!' : 'Book Saved!',
    body: `"${escapeHtml(title || 'Untitled')}" has been ${label}.`,
    confirmLabel: 'Add Another Book',
    cancelLabel: 'Go to Books List',
  });
  return result ? 'add-another' : 'go-to-list';
}

export async function confirmDeleteBook(title: string): Promise<boolean> {
  return showConfirm({
    title: 'Delete this book?',
    body: `"${escapeHtml(title)}" will be permanently removed from your library.`,
    confirmLabel: 'Yes, delete it',
    cancelLabel: 'Cancel',
    confirmDanger: true,
  });
}

export async function confirmArchiveBook(title: string): Promise<boolean> {
  return showConfirm({
    title: 'Archive this book?',
    body: `"${escapeHtml(title)}" will be moved to the archive. You can restore it anytime.`,
    confirmLabel: 'Archive',
    cancelLabel: 'Cancel',
  });
}

export async function showDeleteSuccess(title: string): Promise<'list' | 'stay'> {
  const goList = await showConfirm({
    title: 'Book deleted',
    body: `"${escapeHtml(title)}" has been permanently removed from your library.`,
    confirmLabel: 'Back to books list',
    cancelLabel: 'Stay here',
    confirmDanger: true,
  });
  return goList ? 'list' : 'stay';
}

export async function showArchiveSuccess(title: string): Promise<void> {
  showToast(`"${title}" moved to archive.`, 'success');
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
