/**
 * Isolated attachment + draft-book security probe.
 * Creates a draft book row ONLY if authenticated, uploads tiny private files,
 * verifies signed URLs, verifies anon cannot read draft, then deletes the draft.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

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
const TEST_ID = 'a1111111-1111-4111-8111-111111111111';
const TEST_SLUG = 'task7-audit-isolated-draft-do-not-publish';

const base = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: authData, error: authError } = await base.auth.signInWithPassword({
  email: 'admin@islamicdigitallibrary.com',
  password: 'Admin@12345',
});
if (authError || !authData.session) {
  console.log(JSON.stringify({ blocked: true, reason: authError?.message || 'no session' }));
  process.exit(1);
}

const client = createClient(url, anon, {
  global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

console.log('=== cleanup any prior test book ===');
await client.from('books').delete().eq('id', TEST_ID);
await client.storage.from('book-attachments').remove([
  `${TEST_ID}/probe.mp3`,
  `${TEST_ID}/probe.pdf`,
]);

console.log('=== create draft book ===');
{
  const { data, error } = await client
    .from('books')
    .insert({
      id: TEST_ID,
      slug: TEST_SLUG,
      title: 'TASK7 Isolated Draft (delete after audit)',
      status: 'draft',
      language: 'en',
      description: 'Temporary audit book — unpublished',
      category_ids: [],
      chapters: 0,
    })
    .select('id, slug, status')
    .single();
  console.log(JSON.stringify({ data, error: error?.message || null }, null, 2));
}

console.log('=== anon cannot see draft ===');
{
  const { data, error } = await anonClient.from('books').select('id, status').eq('id', TEST_ID);
  console.log(JSON.stringify({ visibleToAnon: (data || []).length > 0, data, error: error?.message || null }, null, 2));
}

// Minimal PDF
const pdfBytes = Buffer.from(
  `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>endobj
4 0 obj<< /Length 44 >>stream
BT /F1 12 Tf 50 100 Td (Task7 probe) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer<< /Size 5 /Root 1 0 R >>
startxref
307
%%EOF`,
);

// Tiny "mp3" placeholder bytes (not a real player file; tests storage + signed URL)
const mp3Bytes = Buffer.from([
  0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

console.log('=== upload private attachments ===');
{
  const pdfPath = `${TEST_ID}/probe.pdf`;
  const audioPath = `${TEST_ID}/probe.mp3`;
  const upPdf = await client.storage.from('book-attachments').upload(pdfPath, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true,
  });
  const upAudio = await client.storage.from('book-attachments').upload(audioPath, mp3Bytes, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  console.log(
    JSON.stringify(
      {
        pdf: { error: upPdf.error?.message || null, path: pdfPath },
        audio: { error: upAudio.error?.message || null, path: audioPath },
      },
      null,
      2,
    ),
  );

  const signedPdf = await client.storage.from('book-attachments').createSignedUrl(pdfPath, 60);
  const signedAudio = await client.storage.from('book-attachments').createSignedUrl(audioPath, 60);
  console.log(
    JSON.stringify(
      {
        authSignedPdf: Boolean(signedPdf.data?.signedUrl),
        authSignedAudio: Boolean(signedAudio.data?.signedUrl),
        pdfErr: signedPdf.error?.message || null,
        audioErr: signedAudio.error?.message || null,
      },
      null,
      2,
    ),
  );

  // anon signed URL
  const anonSigned = await anonClient.storage.from('book-attachments').createSignedUrl(pdfPath, 60);
  let anonFetchStatus = null;
  if (anonSigned.data?.signedUrl) {
    const res = await fetch(anonSigned.data.signedUrl, { method: 'HEAD' });
    anonFetchStatus = res.status;
  }
  console.log(
    JSON.stringify(
      {
        anonSignedOk: Boolean(anonSigned.data?.signedUrl),
        anonSignedErr: anonSigned.error?.message || null,
        anonFetchStatus,
      },
      null,
      2,
    ),
  );

  // public URL should not work
  const pub = anonClient.storage.from('book-attachments').getPublicUrl(pdfPath);
  const pubRes = await fetch(pub.data.publicUrl, { method: 'HEAD' });
  console.log(JSON.stringify({ publicHttpStatus: pubRes.status }, null, 2));

  // expired signed URL handling: create with 1s and wait
  const short = await client.storage.from('book-attachments').createSignedUrl(pdfPath, 1);
  await new Promise((r) => setTimeout(r, 1500));
  let expiredStatus = null;
  if (short.data?.signedUrl) {
    const res = await fetch(short.data.signedUrl, { method: 'GET' });
    expiredStatus = res.status;
  }
  console.log(JSON.stringify({ expiredSignedHttpStatus: expiredStatus }, null, 2));
}

console.log('=== categories write policy (anon insert should ideally fail) ===');
{
  const { data, error } = await anonClient.from('categories').insert({
    id: 'task7-should-fail-cat',
    name: 'TASK7 FAIL',
    slug: 'task7-fail',
  });
  console.log(JSON.stringify({ data, error: error?.message || null, code: error?.code || null }, null, 2));
  // cleanup if it succeeded (security finding)
  if (!error) {
    await client.from('categories').delete().eq('id', 'task7-should-fail-cat');
  }
}

console.log('=== delete test attachments + draft book ===');
{
  const rem = await client.storage.from('book-attachments').remove([
    `${TEST_ID}/probe.pdf`,
    `${TEST_ID}/probe.mp3`,
  ]);
  const del = await client.from('books').delete().eq('id', TEST_ID).select('id');
  const verify = await client.from('books').select('id').eq('id', TEST_ID);
  console.log(
    JSON.stringify(
      {
        removeErr: rem.error?.message || null,
        deleted: del.data,
        stillExists: (verify.data || []).length > 0,
      },
      null,
      2,
    ),
  );
}

await base.auth.signOut();
console.log('DONE');
