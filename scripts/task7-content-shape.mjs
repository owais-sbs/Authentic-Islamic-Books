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
const c = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ids = [
  'da6297a9-dc08-46ba-a352-e9ede0f42a51',
  '063db3eb-85e2-4734-b14e-a59a62169790',
  'f0aa55d0-4de6-4820-9cd6-6e52b3789104',
];

for (const id of ids) {
  const { data } = await c.storage.from('book-content').download(`${id}/content.json`);
  const j = JSON.parse(await data.text());
  const sec = j.chapters?.[0]?.sections?.[0];
  const content = sec?.content;
  let sample = '';
  let kind = typeof content;
  if (typeof content === 'string') sample = content.slice(0, 400);
  else if (Array.isArray(content)) {
    kind = `array(${content.length}) firstType=${content[0]?.type}`;
    sample = JSON.stringify(content[0]).slice(0, 400);
  } else if (content && typeof content === 'object') {
    kind = `object keys=${Object.keys(content).join(',')}`;
    sample = JSON.stringify(content).slice(0, 400);
  }
  const html = typeof content === 'string' ? content : JSON.stringify(content || '');
  console.log(
    JSON.stringify(
      {
        id,
        topKeys: Object.keys(j),
        introType: typeof j.introduction,
        contentKind: kind,
        hasArabic: /[\u0600-\u06FF]/.test(html),
        hasUrduMarks: /lang=\"ur\"|reader-urdu|dir=\"rtl\"/.test(html),
        hasImg: /<img|content-image|type\":\"image\"/.test(html),
        hasAudio: /type\":\"audio\"|<audio/.test(html),
        hasPdfAttach: /type\":\"pdf\"/.test(html),
        hasQuranClass: /content-quran|data-type=\"quran\"/.test(html),
        hasHadithClass: /content-hadith|data-type=\"hadith\"/.test(html),
        hasTable: /<table/.test(html),
        sample,
      },
      null,
      2,
    ),
  );
}
