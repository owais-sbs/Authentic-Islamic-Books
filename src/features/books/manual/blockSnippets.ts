/** HTML snippets inserted into the manual rich-text editor. */

export type ManualBlockKind =
  | 'paragraph'
  | 'heading'
  | 'section-heading'
  | 'arabic'
  | 'translation'
  | 'bilingual'
  | 'quote'
  | 'claim'
  | 'reference'
  | 'footnote'
  | 'callout'
  | 'image'
  | 'audio'
  | 'pdf';

export const MANUAL_BLOCK_OPTIONS: { kind: ManualBlockKind; label: string }[] = [
  { kind: 'paragraph', label: 'Paragraph' },
  { kind: 'heading', label: 'Chapter heading' },
  { kind: 'section-heading', label: 'Section heading' },
  { kind: 'arabic', label: 'Arabic quotation' },
  { kind: 'translation', label: 'English translation' },
  { kind: 'bilingual', label: 'Arabic + English' },
  { kind: 'quote', label: 'Scholarly quotation' },
  { kind: 'claim', label: 'Claim & response' },
  { kind: 'reference', label: 'Reference / citation' },
  { kind: 'footnote', label: 'Footnote' },
  { kind: 'callout', label: 'Highlighted callout' },
  { kind: 'image', label: 'Image with caption' },
  { kind: 'audio', label: 'Audio resource' },
  { kind: 'pdf', label: 'PDF attachment' },
];

export function snippetForBlock(
  kind: ManualBlockKind,
  imageUrl?: string,
  imageAlign: 'left' | 'center' | 'right' = 'center',
): string {
  switch (kind) {
    case 'paragraph':
      return `<p>Write your paragraph here.</p>`;
    case 'heading':
      return `<h2>Chapter heading</h2>`;
    case 'section-heading':
      return `<h3>Section heading</h3>`;
    case 'arabic':
      return `<p class="content-arabic" dir="rtl" lang="ar">أدخل النص العربي هنا</p>`;
    case 'translation':
      return `<p class="content-translation"><em>English translation of the passage.</em></p>`;
    case 'bilingual':
      return [
        `<p class="content-arabic" dir="rtl" lang="ar">أدخل النص العربي هنا</p>`,
        `<p class="content-translation"><em>English translation.</em></p>`,
      ].join('');
    case 'quote':
      return `<blockquote class="content-quote"><p>Scholarly quotation text.</p><footer>Scholar name</footer></blockquote>`;
    case 'claim':
      return [
        `<div class="content-callout content-claim"><p><strong>Claim:</strong> State the claim clearly.</p>`,
        `<p><strong>Response:</strong> Provide the scholarly response.</p></div>`,
      ].join('');
    case 'reference':
      return `<p class="content-reference">Source: Book title, volume/page.</p>`;
    case 'footnote':
      return `<p class="content-footnote" data-footnote="1"><sup>1</sup> Footnote text.</p>`;
    case 'callout':
      return `<div class="content-callout"><p>Important note for the reader.</p></div>`;
    case 'image': {
      if (!imageUrl) {
        return `<p><em>[Insert an image using the Image button]</em></p>`;
      }
      const alignStyle =
        imageAlign === 'left'
          ? 'text-align:left;margin-right:auto'
          : imageAlign === 'right'
            ? 'text-align:right;margin-left:auto'
            : 'text-align:center;margin-left:auto;margin-right:auto';
      const imgMax =
        imageAlign === 'center' ? 'max-width:min(100%,36rem)' : 'max-width:min(100%,28rem)';
      return `<figure class="content-image content-image-${imageAlign}" data-align="${imageAlign}" style="${alignStyle}"><img src="${imageUrl}" alt="" style="${imgMax};height:auto;border-radius:0.5rem;display:inline-block"/><figcaption>Image caption</figcaption></figure>`;
    }
    case 'audio':
      return `<p class="content-audio"><strong>Audio:</strong> Add audio URL or description for readers.</p>`;
    case 'pdf':
      return `<p class="content-pdf"><strong>PDF:</strong> Link or describe the attached PDF resource.</p>`;
    default:
      return `<p></p>`;
  }
}
