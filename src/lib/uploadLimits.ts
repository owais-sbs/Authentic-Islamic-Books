/**
 * Single source of truth for book PDF upload limits (admin import).
 *
 * PDFs are processed entirely in the browser (pdf.js). Only extracted
 * text/metadata is saved — the PDF binary is not stored for the public reader.
 * Cap is file size (bytes), not page count: a large multi-hundred-page
 * scholarly PDF under 50 MB is allowed.
 */
export const MAX_BOOK_PDF_SIZE_MB = 50;

export const MAX_PDF_SIZE = MAX_BOOK_PDF_SIZE_MB * 1024 * 1024;

/** @deprecated Prefer MAX_PDF_SIZE — kept as alias for clarity in UI helpers */
export const MAX_BOOK_PDF_SIZE_BYTES = MAX_PDF_SIZE;

export function formatMaxBookPdfSize(): string {
  return `${MAX_BOOK_PDF_SIZE_MB} MB`;
}

export type PdfValidationResult =
  | { ok: true }
  | { ok: false; message: string };

/** Validate a candidate book PDF before processing. Rejects before PDF.js starts. */
export function validateBookPdfFile(file: File): PdfValidationResult {
  const isPdf =
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    /\.pdf$/i.test(file.name);

  if (!isPdf) {
    return { ok: false, message: 'Please upload a PDF document.' };
  }

  if (file.size <= 0) {
    return { ok: false, message: 'This PDF appears to be empty.' };
  }

  if (file.size > MAX_PDF_SIZE) {
    return {
      ok: false,
      message: `Maximum book size is ${formatMaxBookPdfSize()}. Please upload a smaller PDF.`,
    };
  }

  return { ok: true };
}
