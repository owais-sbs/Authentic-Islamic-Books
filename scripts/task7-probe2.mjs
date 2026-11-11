import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  const out = {};
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv(resolve(process.cwd(), '.env'));
const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

const BOOK_IDS = [
  'da6297a9-dc08-46ba-a352-e9ede0f42a51',
  '063db3eb-85e2-4734-b14e-a59a62169790',
  'f0aa55d0-4de6-4820-9cd6-6e52b3789104',
];

console.log('=== published books (select *) limited columns ===');
{
  const { data, error } = await client
    .from('books')
    .select('*')
    .eq('status', 'published')
    .limit(10);
  if (error) {
    console.log(JSON.stringify({ error: error.message }, null, 2));
  } else {
    const slim = (data || []).map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      status: b.status,
      source_pdf_path: b.source_pdf_path ?? b.pdf_path ?? null,
      content_path: b.content_path ?? null,
      keys: Object.keys(b).sort(),
    }));
    console.log(JSON.stringify({ count: slim.length, books: slim }, null, 2));
  }
}

console.log('\n=== production IDs by id ===');
{
  const { data, error } = await client.from('books').select('*').in('id', BOOK_IDS);
  console.log(
    JSON.stringify(
      {
        error: error?.message || null,
        found: (data || []).map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          status: b.status,
          source_pdf_path: b.source_pdf_path ?? null,
          content_path: b.content_path ?? null,
          english_title: b.english_title ?? null,
          original_arabic_title: b.original_arabic_title ?? null,
        })),
      },
      null,
      2,
    ),
  );
}

console.log('\n=== content.json fetch for each published book ===');
for (const id of BOOK_IDS) {
  const { data: book } = await client.from('books').select('id, slug, content_path, status').eq('id', id).maybeSingle();
  if (!book) {
    console.log(JSON.stringify({ id, found: false }, null, 2));
    continue;
  }
  const path = book.content_path || `${id}/content.json`;
  const { data: file, error } = await client.storage.from('book-content').download(path);
  let meta = null;
  if (file) {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      meta = {
        chapters: json.chapters?.length ?? 0,
        sections: (json.chapters || []).reduce((n, c) => n + (c.sections?.length || 0), 0),
        hasIntro: Boolean(json.introduction?.length),
        attachments: json.attachments?.length ?? 0,
        blockTypes: (() => {
          const types = new Set();
          const walk = (blocks) => {
            for (const b of blocks || []) {
              if (b?.type) types.add(b.type);
              if (b?.blocks) walk(b.blocks);
            }
          };
          walk(json.introduction);
          for (const ch of json.chapters || []) {
            for (const sec of ch.sections || []) walk(sec.content);
          }
          return [...types].sort();
        })(),
        bytes: text.length,
      };
    } catch (e) {
      meta = { parseError: String(e.message || e) };
    }
  }
  console.log(
    JSON.stringify(
      {
        id,
        slug: book.slug,
        status: book.status,
        content_path: path,
        downloadError: error?.message || null,
        meta,
      },
      null,
      2,
    ),
  );
}

console.log('\n=== storage list via anon (book-pdfs root) ===');
{
  const { data, error } = await client.storage.from('book-pdfs').list('', { limit: 20 });
  console.log(JSON.stringify({ error: error?.message || null, names: (data || []).map((f) => f.name) }, null, 2));
}

console.log('\n=== buckets via REST ===');
{
  const res = await fetch(`${url}/storage/v1/bucket`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  const body = await res.json();
  const slim = Array.isArray(body)
    ? body.map((b) => ({ id: b.id, public: b.public, file_size_limit: b.file_size_limit }))
    : { status: res.status, body };
  console.log(JSON.stringify(slim, null, 2));
}
