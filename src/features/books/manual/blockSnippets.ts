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

export type ImageAlignOption = 'left' | 'center' | 'right' | 'full' | 'wrap-left' | 'wrap-right';
export type ImageWidthOption = 'small' | 'medium' | 'large' | 'full';

const IMAGE_WIDTH_CSS: Record<ImageWidthOption, string> = {
  small: 'max-width:min(100%,16rem)',
  medium: 'max-width:min(100%,28rem)',
  large: 'max-width:min(100%,36rem)',
  full: 'max-width:100%',
};

export function snippetForBlock(
  kind: ManualBlockKind,
  imageUrl?: string,
  imageAlign: ImageAlignOption = 'center',
  imageWidth: ImageWidthOption = 'large',
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
      const width = imageAlign === 'full' ? 'full' : imageWidth;
      const floatStyle =
        imageAlign === 'wrap-left'
          ? 'float:left;margin:0.5rem 1.25rem 0.75rem 0;max-width:min(100%,42%)'
          : imageAlign === 'wrap-right'
            ? 'float:right;margin:0.5rem 0 0.75rem 1.25rem;max-width:min(100%,42%)'
            : imageAlign === 'left'
              ? 'text-align:left;margin-right:auto'
              : imageAlign === 'right'
                ? 'text-align:right;margin-left:auto'
                : imageAlign === 'full'
                  ? 'text-align:center;margin-left:auto;margin-right:auto;width:100%'
                  : 'text-align:center;margin-left:auto;margin-right:auto';
      const imgMax = IMAGE_WIDTH_CSS[width];
      return `<figure class="content-image content-image-${imageAlign}" data-align="${imageAlign}" data-width="${width}" style="${floatStyle}"><img src="${imageUrl}" alt="" style="${imgMax};height:auto;border-radius:0.5rem;display:inline-block"/><figcaption contenteditable="true">Image caption</figcaption></figure><p></p>`;
    }
    case 'audio':
      return `<p class="content-audio"><strong>Audio:</strong> Add audio URL or description for readers.</p>`;
    case 'pdf':
      return `<p class="content-pdf"><strong>PDF:</strong> Link or describe the attached PDF resource.</p>`;
    default:
      return `<p></p>`;
  }
}
