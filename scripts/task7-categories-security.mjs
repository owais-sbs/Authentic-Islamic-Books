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
const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const id = `task7-sec-${Date.now()}`;
const { data, error } = await anon
  .from('categories')
  .insert({ id, name: 'TASK7 SEC PROBE', slug: id })
  .select('id,name')
  .single();
console.log('insert', JSON.stringify({ data, error: error?.message || null }, null, 2));

const { data: found } = await anon.from('categories').select('id,name').eq('id', id);
console.log('visible', JSON.stringify(found, null, 2));

if (found?.length) {
  const { error: delErr } = await anon.from('categories').delete().eq('id', id);
  console.log('anonDelete', JSON.stringify({ delErr: delErr?.message || null }, null, 2));
  const { data: after } = await anon.from('categories').select('id').eq('id', id);
  console.log('afterDelete', JSON.stringify(after, null, 2));
}

const sid = `task7-sch-${Date.now()}`;
const { data: sdata, error: serror } = await anon
  .from('scholars')
  .insert({ id: sid, name: 'TASK7 SCHOLAR', slug: sid })
  .select('id,name')
  .single();
console.log('scholarInsert', JSON.stringify({ data: sdata, error: serror?.message || null }, null, 2));
if (sdata?.id) {
  await anon.from('scholars').delete().eq('id', sid);
  console.log('scholar cleaned');
}
