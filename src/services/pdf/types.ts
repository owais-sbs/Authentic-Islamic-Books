import type { RawPage } from '@/lib/pdfExtractor';

export type BlockType = 'text' | 'possible-heading' | 'list' | 'quote';

export interface NormalizedBlock {
  text: string;
  type: BlockType;
  confidence?: 'high' | 'medium' | 'low';
}

export interface NormalizedPage {
  pageNumber: number;
  blocks: NormalizedBlock[];
}

export interface StructureNode {
  kind: 'introduction' | 'chapter' | 'section' | 'subsection' | 'paragraph' | 'list' | 'quote';
  title?: string;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  level?: number;
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
  | 'normalize'
  | 'extract'
  | 'meta'
  | 'chapters'
  | 'sections'
  | 'numbering'
  | 'build'
  | 'save';

export type PipelineProgressCallback = (stage: PipelineStage, message?: string) => void;
