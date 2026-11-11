/**
 * Task 7 audit probes — never prints full secrets.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  const out = {};
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* missing */
  }
  return out;
}

const env = loadEnv(resolve(process.cwd(), '.env'));
const url = env.VITE_SUPABASE_URL || '';
const anon = env.VITE_SUPABASE_ANON_KEY || '';
const service = env.SUPABASE_SERVICE_ROLE_KEY || '';
const site = env.VITE_SITE_URL || '';

console.log('=== ENV PRESENCE ===');
console.log(
  JSON.stringify(
    {
      VITE_SUPABASE_URL: url ? { set: true, host: url.replace(/^https?:\/\//, '').split('/')[0] } : { set: false },
      VITE_SUPABASE_ANON_KEY: { set: Boolean(anon), len: anon.length },
      SUPABASE_SERVICE_ROLE_KEY: { set: Boolean(service), len: service.length },
      VITE_SITE_URL: site ? { set: true, value: site } : { set: false },
    },
    null,
    2,
  ),
);

if (!url || !anon) {
  console.log('BLOCKED: missing Supabase anon config');
  process.exit(1);
}

const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BOOK_IDS = [
  'da6297a9-dc08-46ba-a352-e9ede0f42a51',
  '063db3eb-85e2-4734-b14e-a59a62169790',
  'f0aa55d0-4de6-4820-9cd6-6e52b3789104',
];

console.log('\n=== ANON: published books ===');
{
  const { data, error } = await anonClient
    .from('books')
    .select('id, slug, title, status, source_pdf_path, content_path, cover_path, created_at, updated_at')
    .in('id', BOOK_IDS);
  console.log(JSON.stringify({ error: error?.message || null, rows: data }, null, 2));
}

console.log('\n=== ANON: draft/unpublished visibility ===');
{
  const { data, error } = await anonClient
    .from('books')
    .select('id, slug, title, status')
    .neq('status', 'published')
    .limit(20);
  console.log(
    JSON.stringify(
      {
        error: error?.message || null,
        count: data?.length ?? 0,
        statuses: [...new Set((data || []).map((b) => b.status))],
        sample: (data || []).slice(0, 5),
      },
      null,
      2,
    ),
  );
}

console.log('\n=== ANON: attempt insert (should fail) ===');
{
  const { data, error } = await anonClient.from('books').insert({
    id: '00000000-0000-4000-8000-000000000099',
    slug: 'task7-audit-should-fail',
    title: 'TASK7 SHOULD FAIL',
    status: 'draft',
  });
  console.log(JSON.stringify({ data, error: error?.message || null, code: error?.code || null }, null, 2));
}

console.log('\n=== AUTH: password login ===');
let sessionClient = null;
{
  const email = 'admin@islamicdigitallibrary.com';
  const password = 'Admin@12345';
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  console.log(
    JSON.stringify(
      {
        ok: Boolean(data.session?.access_token),
        userId: data.user?.id || null,
        email: data.user?.email || null,
        error: error?.message || null,
        mode: data.session ? 'supabase' : 'failed',
      },
      null,
      2,
    ),
  );
  if (data.session) {
    sessionClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}

if (sessionClient) {
  console.log('\n=== AUTH: list all books (incl drafts) ===');
  {
    const { data, error } = await sessionClient
      .from('books')
      .select('id, slug, title, status, source_pdf_path')
      .order('updated_at', { ascending: false })
      .limit(30);
    console.log(
      JSON.stringify(
        {
          error: error?.message || null,
          count: data?.length ?? 0,
          byStatus: (data || []).reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
          }, {}),
          production: (data || []).filter((b) => BOOK_IDS.some((id) => b.id.startsWith(id.slice(0, 8)))),
        },
        null,
        2,
      ),
    );
  }

  console.log('\n=== AUTH: storage buckets list objects ===');
  for (const bucket of ['book-pdfs', 'book-attachments', 'book-covers', 'book-images', 'book-content']) {
    const { data, error } = await sessionClient.storage.from(bucket).list('', { limit: 20 });
    console.log(
      JSON.stringify(
        {
          bucket,
          error: error?.message || null,
          count: data?.length ?? 0,
          names: (data || []).slice(0, 15).map((f) => f.name),
        },
        null,
        2,
      ),
    );
  }

  // Look for PDFs under book id folders
  console.log('\n=== AUTH: book-pdfs per production id ===');
  for (const id of BOOK_IDS) {
    const { data, error } = await sessionClient.storage.from('book-pdfs').list(id, { limit: 20 });
    console.log(JSON.stringify({ id, error: error?.message || null, files: (data || []).map((f) => f.name) }, null, 2));
  }

  console.log('\n=== AUTH: book-attachments sample ===');
  {
    const { data, error } = await sessionClient.storage.from('book-attachments').list('', { limit: 50 });
    console.log(
      JSON.stringify(
        {
          error: error?.message || null,
          count: data?.length ?? 0,
          names: (data || []).map((f) => f.name).slice(0, 30),
        },
        null,
        2,
      ),
    );
  }

  console.log('\n=== AUTH: signed URL for first attachment if any ===');
  {
    const { data: roots } = await sessionClient.storage.from('book-attachments').list('', { limit: 20 });
    let signedTried = null;
    for (const entry of roots || []) {
      if (entry.id === null) {
        const { data: children } = await sessionClient.storage
          .from('book-attachments')
          .list(entry.name, { limit: 10 });
        const file = (children || []).find((c) => c.id);
        if (file) {
          const path = `${entry.name}/${file.name}`;
          const { data, error } = await sessionClient.storage
            .from('book-attachments')
            .createSignedUrl(path, 60);
          signedTried = { path, error: error?.message || null, hasUrl: Boolean(data?.signedUrl) };
          break;
        }
      } else {
        const path = entry.name;
        const { data, error } = await sessionClient.storage
          .from('book-attachments')
          .createSignedUrl(path, 60);
        signedTried = { path, error: error?.message || null, hasUrl: Boolean(data?.signedUrl) };
        break;
      }
    }
    console.log(JSON.stringify(signedTried || { note: 'no attachment files found' }, null, 2));
  }
} else {
  console.log('\nBLOCKED: Supabase Auth login failed — skipping authenticated probes');
}

console.log('\n=== ANON: signed URL on book-attachments (policy check) ===');
{
  // Try a plausible path; expect policy or not-found
  const { data, error } = await anonClient.storage
    .from('book-attachments')
    .createSignedUrl('nonexistent/test.mp3', 60);
  console.log(
    JSON.stringify(
      {
        hasUrl: Boolean(data?.signedUrl),
        error: error?.message || null,
        note: 'Object-not-found after policy allow is OK; RLS/policy deny is a different message',
      },
      null,
      2,
    ),
  );
}

console.log('\n=== ANON: public URL attempt on private buckets ===');
for (const bucket of ['book-attachments', 'book-pdfs']) {
  const { data } = anonClient.storage.from(bucket).getPublicUrl('test/private.pdf');
  const publicUrl = data.publicUrl;
  let httpStatus = null;
  try {
    const res = await fetch(publicUrl, { method: 'HEAD' });
    httpStatus = res.status;
  } catch (e) {
    httpStatus = String(e.message || e);
  }
  console.log(JSON.stringify({ bucket, httpStatus, note: '200 would mean public exposure' }, null, 2));
}

console.log('\n=== SCHEMA: bibliographic columns presence (anon select) ===');
{
  const { data, error } = await anonClient
    .from('books')
    .select('id, original_arabic_title, english_title, translator, publisher, publication_year, isbn')
    .eq('status', 'published')
    .limit(1);
  console.log(
    JSON.stringify(
      {
        error: error?.message || null,
        hasRow: Boolean(data?.[0]),
        columnsPresent: !error,
      },
      null,
      2,
    ),
  );
}

console.log('\nDONE');
