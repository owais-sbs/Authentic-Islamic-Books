/**
 * Extract embedded page images from a PDF.js page for placement in book content.
 */

export interface ExtractedPdfImage {
  dataUrl: string;
  /** PDF user-space Y (bottom origin) — higher = nearer top of page */
  y: number;
  width: number;
  height: number;
}

const MIN_PX = 72;
const MAX_IMAGES_PER_PAGE = 3;
const MAX_EDGE = 1200;

type PdfPageProxy = {
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[] }>;
  objs: { get: (name: string, callback?: (data: unknown) => void) => unknown };
  commonObjs?: { get: (name: string, callback?: (data: unknown) => void) => unknown };
};

function getObj(page: PdfPageProxy, name: string): Promise<unknown> {
  return new Promise((resolve) => {
    const fromPage = page.objs.get(name, resolve);
    if (fromPage) {
      resolve(fromPage);
      return;
    }
    if (page.commonObjs) {
      const fromCommon = page.commonObjs.get(name, resolve);
      if (fromCommon) resolve(fromCommon);
    }
  });
}

function imageDataToDataUrl(
  img: {
    width?: number;
    height?: number;
    data?: Uint8ClampedArray | Uint8Array;
    kind?: number;
  },
): string | null {
  const w = img.width ?? 0;
  const h = img.height ?? 0;
  if (w < MIN_PX || h < MIN_PX) return null;
  if (!img.data || img.data.length === 0) return null;

  const canvas = document.createElement('canvas');
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  try {
    const src = document.createElement('canvas');
    src.width = w;
    src.height = h;
    const sctx = src.getContext('2d');
    if (!sctx) return null;
    const imageData = sctx.createImageData(w, h);
    // PDF.js image data is often RGB (3) or RGBA (4)
    const channels = Math.round(img.data.length / (w * h));
    if (channels === 4) {
      imageData.data.set(img.data as Uint8ClampedArray);
    } else if (channels === 3) {
      for (let i = 0, j = 0; i < w * h; i += 1, j += 3) {
        const o = i * 4;
        imageData.data[o] = img.data[j];
        imageData.data[o + 1] = img.data[j + 1];
        imageData.data[o + 2] = img.data[j + 2];
        imageData.data[o + 3] = 255;
      }
    } else if (channels === 1) {
      for (let i = 0; i < w * h; i += 1) {
        const v = img.data[i];
        const o = i * 4;
        imageData.data[o] = v;
        imageData.data[o + 1] = v;
        imageData.data[o + 2] = v;
        imageData.data[o + 3] = 255;
      }
    } else {
      return null;
    }
    sctx.putImageData(imageData, 0, 0);
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return null;
  }
}

/**
 * Pull a few significant bitmaps from the page operator list.
 * Skips tiny icons / decorative rules.
 */
export async function extractPageImages(
  page: PdfPageProxy,
  opsIds: { paintImageXObject: number; paintInlineImageXObject?: number },
): Promise<ExtractedPdfImage[]> {
  if (typeof document === 'undefined') return [];

  let ops: { fnArray: number[]; argsArray: unknown[] };
  try {
    ops = await page.getOperatorList();
  } catch {
    return [];
  }

  const found: ExtractedPdfImage[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (found.length >= MAX_IMAGES_PER_PAGE) break;
    const fn = ops.fnArray[i];
    if (fn !== opsIds.paintImageXObject && fn !== opsIds.paintInlineImageXObject) continue;

    const args = ops.argsArray[i] as unknown[];
    const name = typeof args?.[0] === 'string' ? args[0] : null;
    if (!name || seen.has(name)) continue;
    seen.add(name);

    try {
      const raw = (await getObj(page, name)) as {
        width?: number;
        height?: number;
        data?: Uint8ClampedArray | Uint8Array;
      } | null;
      if (!raw) continue;
      const dataUrl = imageDataToDataUrl(raw);
      if (!dataUrl) continue;
      found.push({
        dataUrl,
        y: 0,
        width: raw.width ?? 0,
        height: raw.height ?? 0,
      });
    } catch {
      /* skip undecodable image */
    }
  }

  return found;
}

/** Insert image markers into page text so the content parser can place figures. */
export function weaveImagesIntoPageText(text: string, images: ExtractedPdfImage[]): string {
  if (!images.length) return text;
  const markers = images
    .map((img) => `\n\n⟦IDL_IMAGE:${img.dataUrl}⟧\n\n`)
    .join('');
  const trimmed = text.trim();
  if (!trimmed) return markers.trim();
  // Place figures after the first paragraph so captions sit mid-page when possible
  const parts = trimmed.split(/\n{2,}/);
  if (parts.length <= 1) return `${trimmed}${markers}`;
  const mid = Math.min(1, parts.length - 1);
  return [...parts.slice(0, mid + 1), ...images.map((img) => `⟦IDL_IMAGE:${img.dataUrl}⟧`), ...parts.slice(mid + 1)].join(
    '\n\n',
  );
}
