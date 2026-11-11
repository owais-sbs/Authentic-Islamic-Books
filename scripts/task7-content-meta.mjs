import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv(resolve(process.cwd(), '.env'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const IDS = [
  'da6297a9-dc08-46ba-a352-e9ede0f42a51',
  '063db3eb-85e2-4734-b14e-a59a62169790',
  'f0aa55d0-4de6-4820-9cd6-6e52b3789104',
];

function collectTypes(node, types = new Set(), langs = new Set()) {
  if (!node) return { types, langs };
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, types, langs);
    return { types, langs };
  }
  if (typeof node !== 'object') return { types, langs };
  if (typeof node.type === 'string') types.add(node.type);
  if (typeof node.language === 'string') langs.add(node.language);
  if (typeof node.html === 'string') {
    if (/content-quran|data-type=\"quran\"/.test(node.html)) types.add('html:quran');
    if (/content-hadith|data-type=\"hadith\"/.test(node.html)) types.add('html:hadith');
    if (/content-footnote|data-footnote/.test(node.html)) types.add('html:footnote');
    if (/content-claim|content-callout/.test(node.html)) types.add('html:callout');
    if (/dir=\"rtl\"|lang=\"ar\"/.test(node.html)) langs.add('html-ar');
    if (/lang=\"ur\"/.test(node.html)) langs.add('html-ur');
  }
  for (const v of Object.values(node)) {
    if (v && typeof v === 'object') collectTypes(v, types, langs);
  }
  return { types, langs };
}

for (const id of IDS) {
  const { data: book } = await client.from('books').select('id,slug,title,status,content_path,source_pdf_path,pdf_path').eq('id', id).maybeSingle();
  const path = book?.content_path || `${id}/content.json`;
  const { data: blob, error } = await client.storage.from('book-content').download(path);
  if (error || !blob) {
    console.log(JSON.stringify({ id, error: error?.message || 'no blob' }));
    continue;
  }
  const json = JSON.parse(await blob.text());
  const { types, langs } = collectTypes(json);
  const chapters = Array.isArray(json.chapters) ? json.chapters.length : 0;
  let sections = 0;
  for (const ch of json.chapters || []) sections += (ch.sections || []).length;
  console.log(
    JSON.stringify(
      {
        id,
        slug: book.slug,
        status: book.status,
        source_pdf_path: book.source_pdf_path,
        pdf_path: book.pdf_path,
        chapters,
        sections,
        attachments: Array.isArray(json.attachments) ? json.attachments.length : 0,
        types: [...types].sort(),
        langs: [...langs].sort(),
        bytes: JSON.stringify(json).length,
      },
      null,
      2,
    ),
  );
}
