/**
 * Draft persist/refresh probe — never publishes; cleans up after.
 */
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
const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
const ID = 'a2222222-2222-4222-8222-222222222222';

const base = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: auth, error: authErr } = await base.auth.signInWithPassword({
  email: 'admin@islamicdigitallibrary.com',
  password: 'Admin@12345',
});
if (authErr) {
  console.log(JSON.stringify({ blocked: authErr.message }));
  process.exit(1);
}
const client = createClient(url, anon, {
  global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});

await client.from('books').delete().eq('id', ID);
const marker = `TASK7 persist ${Date.now()}`;
const { error: insErr } = await client.from('books').insert({
  id: ID,
  slug: 'task7-persist-draft',
  title: marker,
  status: 'draft',
  language: 'en',
  category_ids: [],
  chapters: 0,
});
const { data: afterInsert } = await client.from('books').select('id,title,status').eq('id', ID).single();

const marker2 = marker + ' UPDATED';
const { error: updErr } = await client.from('books').update({ title: marker2 }).eq('id', ID);
// new client = "refresh"
const client2 = createClient(url, anon, {
  global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: afterRefresh } = await client2.from('books').select('id,title,status').eq('id', ID).single();
const { data: anonSee } = await createClient(url, anon, { auth: { persistSession: false } })
  .from('books')
  .select('id')
  .eq('id', ID);

await client.from('books').delete().eq('id', ID);
const { data: gone } = await client.from('books').select('id').eq('id', ID);

console.log(
  JSON.stringify(
    {
      insertOk: !insErr && afterInsert?.title === marker,
      updateOk: !updErr,
      persistAfterRefresh: afterRefresh?.title === marker2,
      anonCannotSee: (anonSee || []).length === 0,
      cleaned: (gone || []).length === 0,
      insErr: insErr?.message || null,
      updErr: updErr?.message || null,
    },
    null,
    2,
  ),
);
