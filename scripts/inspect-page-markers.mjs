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
  const { data: book } = await c
    .from('books')
    .select('id,slug,title,page_count,chapters')
    .eq('id', id)
    .maybeSingle();
  const { data } = await c.storage.from('book-content').download(`${id}/content.json`);
  const j = JSON.parse(await data.text());
  const html =
    typeof j.chapters?.[0]?.sections?.[0]?.content === 'string'
      ? j.chapters[0].sections[0].content
      : JSON.stringify(j.chapters?.[0]?.sections?.[0]?.content || '');
  const pageAttrs = [...html.matchAll(/data-pdf-page="(\d+)"/g)].map((m) => Number(m[1]));
  const unique = [...new Set(pageAttrs)].sort((a, b) => a - b);
  const markers = [
    ...html.matchAll(/data-page(?:-number)?=["']?(\d+)/gi),
    ...html.matchAll(/<!--\s*page\s*(\d+)/gi),
    ...html.matchAll(/class="[^"]*pdf-page[^"]*"/gi),
  ];
  const secMeta = (j.chapters || []).flatMap((ch) =>
    (ch.sections || []).map((s) => ({
      id: s.id,
      title: s.title,
      pdfPageStart: s.pdfPageStart,
      pdfPageEnd: s.pdfPageEnd,
      contentType: typeof s.content,
    })),
  );
  console.log(
    JSON.stringify(
      {
        id,
        slug: book?.slug,
        dbPageCount: book?.page_count ?? null,
        dbChaptersCol: book?.chapters,
        uniquePdfPageAttrs: unique.slice(0, 40),
        uniquePdfPageAttrCount: unique.length,
        markerHits: markers.length,
        sections: secMeta,
        htmlLen: html.length,
        hasArabicClass: /content-arabic|lang="ar"/.test(html),
        hasUrdu: /lang="ur"|content-urdu/.test(html),
      },
      null,
      2,
    ),
  );
}
