-- ─────────────────────────────────────────────────────────────────────────────
-- Book Storage (Supabase S3) — run in Dashboard → SQL Editor → Run
-- Project: Authentic Islamic Books
--
-- What this does:
-- 1. Adds the content_path column on books
-- 2. Creates the Storage bucket book-content (plus ensures book-covers)
-- 3. Sets Storage RLS so authenticated admins can upload; public can read content
--
-- The original PDF is NOT stored — only the converted book (content.json).
-- The books row keeps metadata + a chapter/section index; full text lives in
-- book-content/{id}/content.json. Books saved before this keep their text in
-- the books.chapters column and still work.
--
-- After running: restart the app (npm run dev). New imports will upload to Storage.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Table column for the Storage object path ──────────────────────────────
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS content_path TEXT;

COMMENT ON COLUMN books.content_path IS 'Storage path in book-content bucket, e.g. {id}/content.json';

-- Ensure created_by exists (shared team audit)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ─── 2. Storage buckets ───────────────────────────────────────────────────────
-- Covers (public images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Structured book content (JSON) — public read so the website can load books
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-content',
  'book-content',
  true,
  157286400, -- 150 MB JSON cap
  ARRAY['application/json', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 3. Storage policies — book-covers ────────────────────────────────────────
DROP POLICY IF EXISTS "book_covers_public_read" ON storage.objects;
CREATE POLICY "book_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "book_covers_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_anon_delete" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_auth_delete" ON storage.objects;

CREATE POLICY "book_covers_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-covers');

-- ─── 4. Storage policies — book-content ───────────────────────────────────────
DROP POLICY IF EXISTS "book_content_public_read" ON storage.objects;
DROP POLICY IF EXISTS "book_content_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_content_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "book_content_auth_delete" ON storage.objects;

CREATE POLICY "book_content_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-content');

CREATE POLICY "book_content_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-content');

CREATE POLICY "book_content_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-content');

CREATE POLICY "book_content_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-content');

-- ─── 5. Verify (optional — check results in the Table editor) ─────────────────
-- SELECT id, name, public, file_size_limit FROM storage.buckets
--   WHERE id IN ('book-covers', 'book-content');
--
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'books' AND column_name = 'content_path';
