import type { RawPage } from '@/lib/pdfExtractor';
import type { BookLanguage, TextDirection } from './language';
import type { DocumentType } from './documentType';

export type { BookLanguage, TextDirection, DocumentType };

export type BlockType = 'text' | 'possible-heading' | 'list' | 'quote';

export interface NormalizedBlock {
  text: string;
  type: BlockType;
  confidence?: 'high' | 'medium' | 'low';
  language?: BookLanguage;
  direction?: TextDirection;
}

export interface NormalizedPage {
  pageNumber: number;
  blocks: NormalizedBlock[];
  /** True when PDF.js found little/no usable text */
  requiresOcr?: boolean;
}

export interface StructureNode {
  kind: 'introduction' | 'chapter' | 'section' | 'subsection' | 'paragraph' | 'list' | 'quote';
  title?: string;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  level?: number;
  language?: BookLanguage;
  children?: StructureNode[];
}

export interface StructuredBookMeta {
  title: string;
  author: string;
  description: string;
  hijriStart?: number;
  hijriEnd?: number;
}

export type PipelineStage =
  | 'read'
  | 'extract'
  | 'ocr'
  | 'normalize'
  | 'languages'
  | 'meta'
  | 'chapters'
  | 'sections'
  | 'numbering'
  | 'markdown'
  | 'build'
  | 'save';

export interface PipelineProgressDetail {
  page?: number;
  totalPages?: number;
  percent?: number;
}

export type PipelineProgressCallback = (
  stage: PipelineStage,
  message?: string,
  detail?: PipelineProgressDetail,
) => void;

export interface ExtractionMeta {
  fileSizeBytes: number;
  pageCount: number;
  wordCount: number;
  documentType: DocumentType;
  languages: BookLanguage[];
  scannedPageNums: number[];
  lowConfidenceHeadings: number;
  warnings: string[];
  /** Intermediate controlled Markdown (not persisted to the public reader) */
  markdown?: string;
  ocrPageCount?: number;
}

/** Re-export RawPage shape for pipeline consumers */
export type { RawPage };
