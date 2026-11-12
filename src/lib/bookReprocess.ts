/**
 * Reprocess an existing book from its retained original PDF (or a newly
 * uploaded PDF when the original was never retained).
 * Updates the same book id — never creates a duplicate.
 * Optionally preserves admin-inserted content images (Storage URLs only).
 */
import { parsePdf } from '@/lib/pdfExtractor';
import { parsedPdfToReviewBook } from '@/lib/pdfImportHelpers';
import { downloadOriginalPdfBlob, uploadOriginalPdf } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { stripDataUriImagesFromBookContent } from '@/lib/stripDataUriImages';
import type { BookWithStructure } from '@/features/books/types';
import type { PipelineProgressCallback } from '@/services/pdf/types';

/** Collect figure HTML blocks that reference http(s) Storage URLs (not base64). */
export function extractImageFiguresFromHtml(html: string): string[] {
  if (!html) return [];
  if (typeof document === 'undefined') {
    const figures: string[] = [];
    const re = /<figure\b[^>]*class="[^"]*content-image[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (/data:image\//i.test(m[0])) continue;
      figures.push(m[0]);
    }
    return figures;
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.querySelectorAll('figure.content-image'))
    .filter((el) => {
      const src = el.querySelector('img')?.getAttribute('src') ?? '';
      return src.startsWith('http') || src.startsWith('/');
    })
    .map((el) => el.outerHTML);
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

function sanitizeBookHtml(book: BookWithStructure): BookWithStructure {
  return {
    ...book,
    introduction: book.introduction
      ? {
          ...book.introduction,
          content: stripDataUriImagesFromBookContent(book.introduction.content),
        }
      : undefined,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      sections: ch.sections.map((sec) => ({
        ...sec,
        content: stripDataUriImagesFromBookContent(sec.content),
      })),
    })),
  };
}

export interface ReprocessOptions {
  preserveImages?: boolean;
  onProgress?: PipelineProgressCallback;
  /**
   * When the book has no sourcePdfPath, pass the PDF file here.
   * It will be retained in book-pdfs and used for extraction.
   */
  pdfFile?: File | Blob;
  pdfFileName?: string;
  /** Prefer freshly extracted title/author when previous meta was a copyright line */
  preferExtractedMeta?: boolean;
}

/**
 * Snapshot of previous content for admin comparison (not persisted automatically).
 */
export function snapshotBookContent(book: BookWithStructure): {
  title: string;
  author: string;
  chapterCount: number;
  sectionCount: number;
  contentChars: number;
  chapters: { number: string; title: string; preview: string }[];
} {
  let contentChars = 0;
  const chapters = book.chapters.map((ch) => {
    const text = ch.sections.map((s) => s.content).join('\n');
    contentChars += text.length;
    return {
      number: ch.number,
      title: ch.title,
      preview: text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240),
    };
  });
  return {
    title: book.title,
    author: (book as unknown as { author?: string }).author ?? book.authorId ?? '',
    chapterCount: book.chapters.length,
    sectionCount: book.chapters.reduce((n, c) => n + c.sections.length, 0),
    contentChars,
    chapters,
  };
}

/**
 * Re-run extraction for an existing book. Never publishes automatically.
 * Requires either sourcePdfPath or options.pdfFile.
 */
export async function reprocessBookFromStoredPdf(
  existing: BookWithStructure,
  options: ReprocessOptions = {},
): Promise<BookWithStructure> {
  let sourcePdfPath = existing.sourcePdfPath;
  let pdfFile: File;

  if (options.pdfFile) {
    const name = options.pdfFileName || 'original.pdf';
    pdfFile =
      options.pdfFile instanceof File
        ? options.pdfFile
        : new File([options.pdfFile], name, { type: 'application/pdf' });
    if (isSupabaseConfigured()) {
      try {
        sourcePdfPath = await uploadOriginalPdf(existing.id, pdfFile, name);
      } catch (err) {
        console.warn('[bookReprocess] PDF retention failed:', err);
      }
    }
  } else if (existing.sourcePdfPath) {
    const blob = await downloadOriginalPdfBlob(existing.sourcePdfPath);
    pdfFile = new File([blob], 'original.pdf', { type: 'application/pdf' });
  } else {
    throw new Error(
      'No original PDF is stored for this book. Upload the PDF again to reprocess — extraction will not run without the source file.',
    );
  }

  const parsed = await parsePdf(pdfFile, options.onProgress);
  const fresh = parsedPdfToReviewBook(parsed, existing.title || pdfFile.name);

  // Guard: never replace existing content with an empty extract
  const freshChars = fresh.chapters.reduce(
    (n, ch) => n + ch.sections.reduce((m, s) => m + (s.content?.length ?? 0), 0),
    0,
  );
  const existingChars = existing.chapters.reduce(
    (n, ch) => n + ch.sections.reduce((m, s) => m + (s.content?.length ?? 0), 0),
    0,
  );
  if (freshChars < 80 && existingChars > 200) {
    throw new Error(
      'Reprocess produced almost no text while the book already has content. Aborted to protect existing text. Try a different PDF or review OCR settings.',
    );
  }

  const preservedImages =
    options.preserveImages !== false ? collectImagesFromBook(existing) : [];

  const preferMeta = options.preferExtractedMeta === true;
  const oldTitleBad =
    /©|copyright|association for multi/i.test(existing.title || '') ||
    /needs review/i.test(existing.title || '');

  let merged: BookWithStructure = {
    ...fresh,
    id: existing.id,
    title:
      preferMeta || oldTitleBad
        ? fresh.title || existing.title
        : existing.title || fresh.title,
    subtitle: existing.subtitle ?? fresh.subtitle,
    englishTitle: existing.englishTitle,
    originalArabicTitle: existing.originalArabicTitle,
    authorName:
      preferMeta || !existing.authorName
        ? fresh.authorName || existing.authorName
        : existing.authorName || fresh.authorName,
    authorId: existing.authorId ?? fresh.authorId,
    translator: existing.translator,
    publisher: existing.publisher,
    publicationYear: existing.publicationYear,
    isbn: existing.isbn,
    description: existing.description || fresh.description,
    coverUrl: existing.coverUrl ?? fresh.coverUrl,
    coverColor: existing.coverColor || fresh.coverColor,
    categories: existing.categories.length ? existing.categories : fresh.categories,
    language: existing.language || fresh.language,
    featured: existing.featured,
    attachments: existing.attachments,
    sourcePdfPath: sourcePdfPath ?? existing.sourcePdfPath,
    sourcePdfUrl: existing.sourcePdfUrl,
    importMethod: existing.importMethod ?? 'upload',
    licenceNote: existing.licenceNote,
    importedAt: existing.importedAt ?? new Date().toISOString(),
    createdAt: existing.createdAt,
    presentationFormat: existing.presentationFormat,
    creationMethod: existing.creationMethod ?? 'pdf_import',
    status: 'needs_review',
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  merged = {
    ...merged,
    chapters: merged.chapters.map((ch) => ({
      ...ch,
      bookId: existing.id,
      sections: ch.sections.map((sec) => ({ ...sec, chapterId: ch.id })),
    })),
  };

  merged = sanitizeBookHtml(merged);

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
