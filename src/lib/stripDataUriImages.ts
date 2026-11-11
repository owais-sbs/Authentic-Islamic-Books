/**
 * Remove embedded base64 images from HTML book content.
 * Images belong in Supabase Storage (book-images), not inside content.json.
 * Replaces data-URI <img> / <figure> with a review placeholder.
 */

const DATA_URI_IMG =
  /<img\b[^>]*\bsrc\s*=\s*["']data:image\/[^"']+["'][^>]*>/gi;
const DATA_URI_FIGURE =
  /<figure\b[^>]*class="[^"]*content-image[^"]*"[^>]*>[\s\S]*?data:image\/[\s\S]*?<\/figure>/gi;

export function stripDataUriImages(html: string): {
  html: string;
  removed: number;
} {
  if (!html || !/data:image\//i.test(html)) {
    return { html: html || '', removed: 0 };
  }
  let removed = 0;
  let out = html.replace(DATA_URI_FIGURE, () => {
    removed += 1;
    return `<p><em>[Embedded image removed — re-upload via the image button so it is stored in book-images]</em></p>`;
  });
  out = out.replace(DATA_URI_IMG, () => {
    removed += 1;
    return `<p><em>[Embedded image removed — re-upload via the image button]</em></p>`;
  });
  return { html: out, removed };
}

export function stripDataUriImagesFromBookContent(content: string): string {
  return stripDataUriImages(content).html;
}
