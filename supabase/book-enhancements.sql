-- ─────────────────────────────────────────────────────────────────────────────
-- Book enhancements — original PDFs, content images, import metadata
-- Run in Supabase Dashboard → SQL Editor after book-storage.sql
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Book source / licence columns ─────────────────────────────────────────
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS content_path TEXT,
  ADD COLUMN IF NOT EXISTS source_pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS source_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS import_method TEXT,
  ADD COLUMN IF NOT EXISTS licence_note TEXT,
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

COMMENT ON COLUMN books.source_pdf_path IS 'Private Storage path in book-pdfs, e.g. {id}/original.pdf';
COMMENT ON COLUMN books.source_pdf_url IS 'Optional authorized external PDF URL used for import';
COMMENT ON COLUMN books.import_method IS 'upload | url | manual';
COMMENT ON COLUMN books.licence_note IS 'Copyright / licence note for the source PDF';

-- ─── 2. Extraction job tracking (optional; app can also use session state) ───
CREATE TABLE IF NOT EXISTS book_extraction_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id         UUID REFERENCES books(id) ON DELETE SET NULL,
  import_method   TEXT NOT NULL DEFAULT 'upload',
  status          TEXT NOT NULL DEFAULT 'pending',
  stage           TEXT,
  progress        INTEGER NOT NULL DEFAULT 0,
  total_pages     INTEGER,
  completed_pages INTEGER DEFAULT 0,
  ocr_pages       INTEGER[] DEFAULT '{}',
  failed_pages    INTEGER[] DEFAULT '{}',
  warnings        TEXT[] DEFAULT '{}',
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_extraction_jobs_book_idx ON book_extraction_jobs (book_id);
CREATE INDEX IF NOT EXISTS book_extraction_jobs_status_idx ON book_extraction_jobs (status);

ALTER TABLE book_extraction_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "extraction_jobs_auth_all" ON book_extraction_jobs;
CREATE POLICY "extraction_jobs_auth_all"
  ON book_extraction_jobs FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "extraction_jobs_anon_select" ON book_extraction_jobs;
CREATE POLICY "extraction_jobs_anon_select"
  ON book_extraction_jobs FOR SELECT TO anon
  USING (true);

-- ─── 3. Storage: original PDFs (private) ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-pdfs',
  'book-pdfs',
  false,
  157286400, -- 150 MB
  ARRAY['application/pdf', 'application/x-pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "book_pdfs_auth_select" ON storage.objects;
DROP POLICY IF EXISTS "book_pdfs_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_pdfs_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "book_pdfs_auth_delete" ON storage.objects;

CREATE POLICY "book_pdfs_auth_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book-pdfs');

CREATE POLICY "book_pdfs_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-pdfs');

CREATE POLICY "book_pdfs_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-pdfs');

CREATE POLICY "book_pdfs_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-pdfs');

-- ─── 4. Storage: in-content chapter images (public read) ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-images',
  'book-images',
  true,
  10485760, -- 10 MB per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "book_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "book_images_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_images_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "book_images_auth_delete" ON storage.objects;

CREATE POLICY "book_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-images');

CREATE POLICY "book_images_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-images');

CREATE POLICY "book_images_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-images');

CREATE POLICY "book_images_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-images');
