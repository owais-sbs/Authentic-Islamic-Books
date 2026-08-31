import Swal from 'sweetalert2';

const gold = '#C9A646';
const ink = '#0B1B2B';

export async function showBookSavedSuccess(
  title: string,
  mode: 'draft' | 'published'
): Promise<'add-another' | 'go-to-list'> {
  const result = await Swal.fire({
    icon: 'success',
    title: mode === 'published' ? 'Book Published!' : 'Book Saved!',
    html: `<p style="color:#64748B;font-size:14px;margin:0">"<strong>${escapeHtml(title || 'Untitled')}</strong>" has been ${mode === 'published' ? 'published to the library' : 'saved as a draft'}.</p>`,
    showCancelButton: true,
    confirmButtonText: 'Add Another Book',
    cancelButtonText: 'Go to Books List',
    confirmButtonColor: gold,
    cancelButtonColor: ink,
    reverseButtons: true,
  });

  return result.isConfirmed ? 'add-another' : 'go-to-list';
}

export async function confirmDeleteBook(title: string): Promise<boolean> {
  const result = await Swal.fire({
    title: 'Delete this book?',
    html: `<p style="color:#64748B;font-size:14px">"<strong>${escapeHtml(title)}</strong>" will be permanently removed from your library.</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: ink,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function confirmArchiveBook(title: string): Promise<boolean> {
  const result = await Swal.fire({
    title: 'Archive this book?',
    html: `<p style="color:#64748B;font-size:14px">"<strong>${escapeHtml(title)}</strong>" will be moved to the archive. You can restore it anytime from <strong>Archived Books</strong>.</p>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Archive',
    cancelButtonText: 'Cancel',
    confirmButtonColor: gold,
    cancelButtonColor: ink,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function showDeleteSuccess(title: string): Promise<void> {
  await Swal.fire({
    icon: 'success',
    title: 'Book Deleted',
    html: `<p style="color:#64748B;font-size:14px">"<strong>${escapeHtml(title)}</strong>" has been removed.</p>`,
    confirmButtonColor: gold,
    timer: 1800,
    showConfirmButton: false,
  });
}

export async function showArchiveSuccess(title: string): Promise<void> {
  await Swal.fire({
    icon: 'success',
    title: 'Book Archived',
    html: `<p style="color:#64748B;font-size:14px">"<strong>${escapeHtml(title)}</strong>" moved to archive.</p>`,
    confirmButtonColor: gold,
    timer: 1800,
    showConfirmButton: false,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
