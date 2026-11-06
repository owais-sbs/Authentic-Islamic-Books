/**
 * Secure PDF URL fetch for admin import.
 * Blocks private/link-local hosts (SSRF), redirects to private IPs, and non-PDF responses.
 *
 * Deployed as Netlify Function: /.netlify/functions/fetch-pdf
 * Body: { url: string }
 * Returns: binary PDF (application/pdf) or JSON error.
 */

const MAX_BYTES = 150 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 60_000;

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return true;
  if (h === 'metadata.google.internal') return true;

  // IPv4
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  // IPv6 local / link-local
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
  return false;
}

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  };
}

async function fetchPdf(urlStr: string, redirectsLeft: number): Promise<Response> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error('Invalid URL');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are allowed');
  }
  if (isPrivateHostname(parsed.hostname)) {
    throw new Error('URL host is not allowed');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf,application/octet-stream,*/*',
        'User-Agent': 'AuthenticIslamicBooks-Import/1.0',
      },
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc || redirectsLeft <= 0) throw new Error('Too many redirects or missing Location');
      const next = new URL(loc, parsed).toString();
      return fetchPdf(next, redirectsLeft - 1);
    }

    if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function handler(event: {
  httpMethod: string;
  body: string | null;
}) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}') as { url?: string };
    const url = payload.url?.trim();
    if (!url) return json(400, { error: 'Missing url' });

    const res = await fetchPdf(url, MAX_REDIRECTS);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const lenHeader = res.headers.get('content-length');
    if (lenHeader && Number(lenHeader) > MAX_BYTES) {
      return json(413, { error: 'PDF exceeds 150 MB limit' });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) return json(400, { error: 'Empty response' });
    if (buf.byteLength > MAX_BYTES) return json(413, { error: 'PDF exceeds 150 MB limit' });

    const looksPdf =
      contentType.includes('pdf') ||
      buf.slice(0, 5).toString('utf8') === '%PDF-';
    if (!looksPdf) {
      return json(415, { error: 'URL did not return a PDF' });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(buf.byteLength),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      isBase64Encoded: true,
      body: buf.toString('base64'),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Download failed';
    return json(400, { error: message });
  }
}
