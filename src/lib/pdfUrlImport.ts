/**
 * Fetch an authorized PDF URL for admin import.
 * Prefers Netlify function (SSRF-safe). Falls back to browser fetch (CORS-limited).
 */

import { validateBookPdfFile, formatMaxBookPdfSize } from '@/lib/uploadLimits';

function fileFromBytes(bytes: ArrayBuffer, name: string): File {
  return new File([bytes], name, { type: 'application/pdf' });
}

function guessFileName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split('/').pop() || 'imported.pdf';
    return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
  } catch {
    return 'imported.pdf';
  }
}

async function fetchViaNetlifyFunction(url: string): Promise<ArrayBuffer> {
  const endpoint = '/.netlify/functions/fetch-pdf';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    let message = `Download failed (HTTP ${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.arrayBuffer();
}

async function fetchDirect(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
  const type = (res.headers.get('content-type') || '').toLowerCase();
  const buf = await res.arrayBuffer();
  const head = new TextDecoder().decode(buf.slice(0, 5));
  if (!type.includes('pdf') && head !== '%PDF-') {
    throw new Error('URL did not return a PDF');
  }
  return buf;
}

/**
 * Download a PDF from an authorized URL into a File for the existing import pipeline.
 */
export async function downloadPdfFromUrl(url: string): Promise<File> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('Enter a valid http(s) PDF URL');
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await fetchViaNetlifyFunction(trimmed);
  } catch (fnErr) {
    // Local Vite / missing function — try browser fetch (subject to CORS)
    try {
      bytes = await fetchDirect(trimmed);
    } catch (directErr) {
      const a = fnErr instanceof Error ? fnErr.message : 'Function download failed';
      const b = directErr instanceof Error ? directErr.message : 'Direct download failed';
      throw new Error(
        `${b}. Secure download also unavailable (${a}). Use a CORS-enabled PDF host, deploy the Netlify fetch-pdf function, or upload the file instead.`,
      );
    }
  }

  const name = guessFileName(trimmed);
  const file = fileFromBytes(bytes, name);
  const validation = validateBookPdfFile(file);
  if (!validation.ok) {
    throw new Error(
      validation.message.includes('Maximum')
        ? `Downloaded file exceeds ${formatMaxBookPdfSize()}`
        : validation.message,
    );
  }
  return file;
}
