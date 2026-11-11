-- ─────────────────────────────────────────────────────────────────────────────
-- Admin review enhancements — bibliographic columns + private attachments bucket
-- Run in Supabase Dashboard → SQL Editor AFTER book-enhancements.sql
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT).
--
-- Why:
-- 1. Optional books.* columns for catalogue metadata used by the admin review UI.
--    The app also stores these fields inside content.json so books keep working
--    before this script is applied.
-- 2. Private `book-attachments` bucket for audio / supplemental PDFs.
--    Access is authenticated-only; the app uses short-lived signed URLs.
--    Do NOT make this bucket public.
--
-- Does NOT create duplicate book tables. Does NOT change published content.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Bibliographic columns on books ───────────────────────────────────────
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS original_arabic_title TEXT,
  ADD COLUMN IF NOT EXISTS english_title TEXT,
  ADD COLUMN IF NOT EXISTS translator TEXT,
  ADD COLUMN IF NOT EXISTS publisher TEXT,
  ADD COLUMN IF NOT EXISTS publication_year INTEGER,
  ADD COLUMN IF NOT EXISTS isbn TEXT;

COMMENT ON COLUMN books.original_arabic_title IS 'Original Arabic title of the work';
COMMENT ON COLUMN books.english_title IS 'English title when distinct from title';
COMMENT ON COLUMN books.translator IS 'Translator name(s)';
COMMENT ON COLUMN books.publisher IS 'Publisher name';
COMMENT ON COLUMN books.publication_year IS 'Gregorian publication year';
COMMENT ON COLUMN books.isbn IS 'ISBN-10 or ISBN-13 when available';

-- ─── 2. Private attachments bucket (audio + supplemental PDFs) ───────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-attachments',
  'book-attachments',
  false,
  104857600, -- 100 MB
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'application/pdf',
    'application/x-pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "book_attachments_auth_select" ON storage.objects;
DROP POLICY IF EXISTS "book_attachments_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_attachments_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "book_attachments_auth_delete" ON storage.objects;

CREATE POLICY "book_attachments_auth_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book-attachments');

CREATE POLICY "book_attachments_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-attachments');

CREATE POLICY "book_attachments_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-attachments');

CREATE POLICY "book_attachments_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-attachments');

-- ─── 3. Verify (optional) ────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'books'
--     AND column_name IN (
--       'original_arabic_title','english_title','translator',
--       'publisher','publication_year','isbn'
--     );
-- SELECT id, public FROM storage.buckets WHERE id = 'book-attachments';
