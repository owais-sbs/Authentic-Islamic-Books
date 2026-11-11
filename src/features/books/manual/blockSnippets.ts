/** HTML snippets inserted into the scholarly rich-text editor. */

export type ManualBlockKind =
  | 'paragraph'
  | 'heading'
  | 'section-heading'
  | 'arabic'
  | 'urdu'
  | 'translation'
  | 'bilingual'
  | 'quran'
  | 'hadith'
  | 'quote'
  | 'claim'
  | 'reference'
  | 'citation'
  | 'footnote'
  | 'endnote'
  | 'callout'
  | 'table'
  | 'image'
  | 'audio'
  | 'pdf';

export const MANUAL_BLOCK_OPTIONS: { kind: ManualBlockKind; label: string }[] = [
  { kind: 'paragraph', label: 'English paragraph' },
  { kind: 'heading', label: 'Heading' },
  { kind: 'section-heading', label: 'Subheading' },
  { kind: 'arabic', label: 'Arabic paragraph' },
  { kind: 'urdu', label: 'Urdu paragraph' },
  { kind: 'translation', label: 'English translation' },
  { kind: 'bilingual', label: 'Arabic + English pair' },
  { kind: 'quran', label: 'Quranic quotation' },
  { kind: 'hadith', label: 'Hadith quotation' },
  { kind: 'quote', label: 'Scholarly quotation' },
  { kind: 'claim', label: 'Claim & response' },
  { kind: 'reference', label: 'Reference' },
  { kind: 'citation', label: 'Citation' },
  { kind: 'footnote', label: 'Footnote' },
  { kind: 'endnote', label: 'Endnote' },
  { kind: 'callout', label: 'Highlighted callout' },
  { kind: 'table', label: 'Table' },
  { kind: 'image', label: 'Image with caption' },
  { kind: 'audio', label: 'Audio attachment' },
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

export interface AttachmentSnippetOptions {
  url?: string;
  fileName?: string;
  storagePath?: string;
  bucket?: string;
  caption?: string;
  pdfPage?: number;
  attachmentId?: string;
}

export function snippetForBlock(
  kind: ManualBlockKind,
  imageUrl?: string,
  imageAlign: ImageAlignOption = 'center',
  imageWidth: ImageWidthOption = 'large',
  attachment?: AttachmentSnippetOptions,
): string {
  switch (kind) {
    case 'paragraph':
      return `<p lang="en" dir="ltr">Write your English paragraph here.</p>`;
    case 'heading':
      return `<h2>Heading</h2>`;
    case 'section-heading':
      return `<h3>Subheading</h3>`;
    case 'arabic':
      return `<p class="content-arabic" dir="rtl" lang="ar">أدخل النص العربي هنا</p>`;
    case 'urdu':
      return `<p class="content-urdu" dir="rtl" lang="ur">اردو متن یہاں لکھیں</p>`;
    case 'translation':
      return `<p class="content-translation" lang="en" dir="ltr"><em>English translation of the passage.</em></p>`;
    case 'bilingual':
      return [
        `<div class="content-bilingual">`,
        `<p class="content-arabic" dir="rtl" lang="ar">أدخل النص العربي هنا</p>`,
        `<p class="content-translation" lang="en" dir="ltr"><em>English translation.</em></p>`,
        `</div>`,
      ].join('');
    case 'quran':
      return [
        `<blockquote class="content-quran" data-type="quran">`,
        `<p class="content-arabic" dir="rtl" lang="ar">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>`,
        `<p class="content-translation" lang="en" dir="ltr"><em>In the name of Allah, the Most Gracious, the Most Merciful.</em></p>`,
        `<footer class="content-reference">Qur’an 1:1</footer>`,
        `</blockquote>`,
      ].join('');
    case 'hadith':
      return [
        `<blockquote class="content-hadith" data-type="hadith">`,
        `<p>Hadith text in English.</p>`,
        `<p class="content-arabic" dir="rtl" lang="ar">نص الحديث بالعربية</p>`,
        `<footer class="content-reference">Narrator — Collection, no. 000</footer>`,
        `</blockquote>`,
      ].join('');
    case 'quote':
      return `<blockquote class="content-quote"><p>Scholarly quotation text.</p><footer>Scholar name</footer></blockquote>`;
    case 'claim':
      return [
        `<div class="content-callout content-claim" style="border-left:3px solid #B91C1C;background:#FEF2F2;padding:0.75rem 1rem;margin:0.75rem 0">`,
        `<p><strong>Claim:</strong> State the claim clearly.</p>`,
        `<p><strong>Response:</strong> Provide the scholarly response.</p></div>`,
      ].join('');
    case 'reference':
      return `<p class="content-reference">Source: Book title, volume/page.</p>`;
    case 'citation':
      return `<cite class="content-citation">Author, <em>Work</em>, ed./trans., publisher, year, p. 00.</cite>`;
    case 'footnote':
      return `<p class="content-footnote" data-footnote="1" data-anchor-id="fn-1"><sup>1</sup> Footnote text.</p>`;
    case 'endnote':
      return `<p class="content-endnote" data-endnote="1" data-anchor-id="en-1"><sup>1</sup> Endnote text.</p>`;
    case 'callout':
      return `<div class="content-callout" style="border-left:3px solid #C9A646;background:#FFFBEB;padding:0.75rem 1rem;margin:0.75rem 0"><p>Important note for the reader.</p></div>`;
    case 'table':
      return [
        `<table class="content-table" style="width:100%;border-collapse:collapse;margin:0.75rem 0">`,
        `<thead><tr><th style="border:1px solid #E5E1D8;padding:0.4rem;text-align:left">Column A</th>`,
        `<th style="border:1px solid #E5E1D8;padding:0.4rem;text-align:left">Column B</th></tr></thead>`,
        `<tbody><tr><td style="border:1px solid #E5E1D8;padding:0.4rem">Cell</td>`,
        `<td style="border:1px solid #E5E1D8;padding:0.4rem">Cell</td></tr></tbody></table><p></p>`,
      ].join('');
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
      return `<figure class="content-image content-image-${imageAlign}" data-align="${imageAlign}" data-width="${width}" style="${floatStyle}"><img src="${imageUrl}" alt="" style="${imgMax};height:auto;border-radius:0.5rem;display:inline-block;max-width:100%"/><figcaption contenteditable="true">Image caption</figcaption></figure><p></p>`;
    }
    case 'audio': {
      const name = attachment?.fileName || 'Audio explanation';
      const path = attachment?.storagePath || '';
      const bucket = attachment?.bucket || 'book-attachments';
      const page = attachment?.pdfPage != null ? ` data-pdf-page="${attachment.pdfPage}"` : '';
      const idAttr = attachment?.attachmentId ? ` data-attachment-id="${attachment.attachmentId}"` : '';
      const src = attachment?.url
        ? `<audio controls preload="none" src="${attachment.url}" style="width:100%;max-width:100%"></audio>`
        : `<span class="content-attachment-pending">Upload audio via Media manager</span>`;
      return `<figure class="content-audio" data-kind="audio" data-storage-path="${path}" data-bucket="${bucket}"${page}${idAttr} style="margin:0.75rem 0;padding:0.75rem;border:1px solid #E5E1D8;border-radius:0.5rem;background:#F7F6F2"><figcaption><strong>Audio:</strong> ${name}${attachment?.caption ? ` — ${attachment.caption}` : ''}</figcaption>${src}</figure><p></p>`;
    }
    case 'pdf': {
      const name = attachment?.fileName || 'PDF attachment';
      const path = attachment?.storagePath || '';
      const bucket = attachment?.bucket || 'book-attachments';
      const page = attachment?.pdfPage != null ? ` data-pdf-page="${attachment.pdfPage}"` : '';
      const idAttr = attachment?.attachmentId ? ` data-attachment-id="${attachment.attachmentId}"` : '';
      const link = attachment?.url
        ? `<a href="${attachment.url}" target="_blank" rel="noopener noreferrer">Open PDF</a>`
        : `<span class="content-attachment-pending">Upload PDF via Media manager</span>`;
      return `<figure class="content-pdf" data-kind="pdf" data-storage-path="${path}" data-bucket="${bucket}"${page}${idAttr} style="margin:0.75rem 0;padding:0.75rem;border:1px solid #E5E1D8;border-radius:0.5rem;background:#F7F6F2"><figcaption><strong>PDF:</strong> ${name}${attachment?.caption ? ` — ${attachment.caption}` : ''}</figcaption><p>${link}</p></figure><p></p>`;
    }
    default:
      return `<p></p>`;
  }
}
