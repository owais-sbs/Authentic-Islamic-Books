/**
 * Reprocess an existing book from its retained original PDF.
 * Updates the same book id — never creates a duplicate.
 * Optionally preserves admin-inserted content images.
 */
import { parsePdf } from '@/lib/pdfExtractor';
import { parsedPdfToReviewBook } from '@/lib/pdfImportHelpers';
import { downloadOriginalPdfBlob } from '@/lib/bookApi';
import type { BookWithStructure } from '@/features/books/types';
import type { PipelineProgressCallback } from '@/services/pdf/types';

/** Collect figure HTML blocks (admin-inserted images) from stored content. */
export function extractImageFiguresFromHtml(html: string): string[] {
  if (!html || typeof document === 'undefined') {
    // Fallback regex for non-DOM environments
    const figures: string[] = [];
    const re = /<figure\b[^>]*class="[^"]*content-image[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) figures.push(m[0]);
    return figures;
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.querySelectorAll('figure.content-image')).map((el) => el.outerHTML);
}

function collectImagesFromBook(book: BookWithStructure): string[] {
  const out: string[] = [];
  if (book.introduction?.content) {
    out.push(...extractImageFiguresFromHtml(book.introduction.content));
  }
  for (const ch of book.chapters) {
    for (const sec of ch.sections) {
      out.push(...extractImageFiguresFromHtml(sec.content));
    }
  }
  return out;
}

function appendImagesToFirstSection(book: BookWithStructure, figures: string[]): BookWithStructure {
  if (!figures.length) return book;
  const append = figures.join('\n');
  if (book.chapters[0]?.sections[0]) {
    const chapters = book.chapters.map((ch, ci) => {
      if (ci !== 0) return ch;
      return {
        ...ch,
        sections: ch.sections.map((sec, si) => {
          if (si !== 0) return sec;
          return { ...sec, content: `${sec.content}\n${append}` };
        }),
      };
    });
    return { ...book, chapters };
  }
  if (book.introduction) {
    return {
      ...book,
      introduction: {
        ...book.introduction,
        content: `${book.introduction.content}\n${append}`,
      },
    };
  }
  return book;
}

export interface ReprocessOptions {
  preserveImages?: boolean;
  onProgress?: PipelineProgressCallback;
}

/**
 * Download the stored original PDF, re-run extraction, and merge into the
 * existing book record (same id / source paths / licence).
 */
export async function reprocessBookFromStoredPdf(
  existing: BookWithStructure,
  options: ReprocessOptions = {},
): Promise<BookWithStructure> {
  if (!existing.sourcePdfPath) {
    throw new Error(
      'No original PDF is stored for this book. Re-import the PDF or upload it again.',
    );
  }

  const blob = await downloadOriginalPdfBlob(existing.sourcePdfPath);
  const file = new File([blob], 'original.pdf', { type: 'application/pdf' });
  const parsed = await parsePdf(file, options.onProgress);
  const fresh = parsedPdfToReviewBook(parsed, existing.title || 'original.pdf');

  const preservedImages =
    options.preserveImages !== false ? collectImagesFromBook(existing) : [];

  let merged: BookWithStructure = {
    ...fresh,
    // Keep identity + admin metadata
    id: existing.id,
    title: existing.title || fresh.title,
    subtitle: existing.subtitle ?? fresh.subtitle,
    authorName: existing.authorName || fresh.authorName,
    authorId: existing.authorId ?? fresh.authorId,
    description: existing.description || fresh.description,
    coverUrl: existing.coverUrl ?? fresh.coverUrl,
    coverColor: existing.coverColor || fresh.coverColor,
    categories: existing.categories.length ? existing.categories : fresh.categories,
    featured: existing.featured,
    sourcePdfPath: existing.sourcePdfPath,
    sourcePdfUrl: existing.sourcePdfUrl,
    importMethod: existing.importMethod,
    licenceNote: existing.licenceNote,
    importedAt: existing.importedAt,
    createdAt: existing.createdAt,
    presentationFormat: existing.presentationFormat,
    creationMethod: existing.creationMethod ?? 'pdf_import',
    status: 'needs_review',
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  // Keep chapter/section content from re-extraction, but restore bookIds
  merged = {
    ...merged,
    chapters: merged.chapters.map((ch) => ({
      ...ch,
      bookId: existing.id,
      sections: ch.sections.map((sec) => ({ ...sec, chapterId: ch.id })),
    })),
  };

  if (preservedImages.length) {
    merged = appendImagesToFirstSection(merged, preservedImages);
    const warnings = [
      ...(merged.extractionInfo?.warnings ?? []),
      `Preserved ${preservedImages.length} admin-inserted image(s) after reprocess — review placement.`,
    ];
    merged = {
      ...merged,
      extractionInfo: { ...merged.extractionInfo, warnings },
    };
  }

  return merged;
}
