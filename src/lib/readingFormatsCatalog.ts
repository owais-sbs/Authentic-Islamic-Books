import type { PresentationFormatId } from '@/features/books/types';

export interface PresentationFormatOption {
  id: PresentationFormatId;
  number: string;
  name: string;
  summary: string;
}

/** Formats 01–06 for the manual editor selector (maps to /library demos). */
export const PRESENTATION_FORMATS: PresentationFormatOption[] = [
  {
    id: 'classic-book',
    number: '01',
    name: 'Classic Digital Book',
    summary: 'Cover, chapters, English prose, Arabic column, footnotes.',
  },
  {
    id: 'research-article',
    number: '02',
    name: 'Scholarly Research Article',
    summary: 'Drop-cap article layout with citations and references.',
  },
  {
    id: 'numbered-refutation',
    number: '03',
    name: 'Numbered Refutation',
    summary: 'Claim-and-response blocks with numbered clarifications.',
  },
  {
    id: 'quote-reader',
    number: '04',
    name: 'Quote-Centered Reading',
    summary: 'Arabic quotations first, then translation and commentary.',
  },
  {
    id: 'audio-pdf',
    number: '05',
    name: 'Audio + PDF Resource',
    summary: 'Long-form text with audio and PDF resource actions.',
  },
  {
    id: 'combined-edition',
    number: '06',
    name: 'Complete Scholarly Edition',
    summary: 'All-in-one scholarly layout (default for published books).',
  },
];

export const DEFAULT_PRESENTATION_FORMAT: PresentationFormatId = 'combined-edition';
