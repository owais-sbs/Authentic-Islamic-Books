-- ─────────────────────────────────────────────────────────────────────────────
-- Islamic Digital Library — Books schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Status enum ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE book_status AS ENUM (
    'draft', 'published', 'needs_review', 'archived', 'processing', 'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Books table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL DEFAULT '',
  subtitle      TEXT,
  author_name   TEXT,
  author_id     TEXT DEFAULT 'scholar-ibn-kathir',
  description   TEXT,
  long_description TEXT,
  cover_color   TEXT NOT NULL DEFAULT '#18231F',
  cover_url     TEXT,
  hijri_start   INTEGER,
  hijri_end     INTEGER,
  category_ids  TEXT[] NOT NULL DEFAULT '{}',
  status        book_status NOT NULL DEFAULT 'draft',
  language      TEXT NOT NULL DEFAULT 'English',
  featured      BOOLEAN NOT NULL DEFAULT false,
  popularity    INTEGER NOT NULL DEFAULT 50,
  introduction  JSONB,
  chapters      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_status_idx ON books (status);
CREATE INDEX IF NOT EXISTS books_slug_idx   ON books (slug);
CREATE INDEX IF NOT EXISTS books_updated_idx ON books (updated_at DESC);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_set_updated_at ON books;
CREATE TRIGGER books_set_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security (prototype: open for anon admin — tighten with auth later)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "books_select_all" ON books;
CREATE POLICY "books_select_all"
  ON books FOR SELECT USING (true);

DROP POLICY IF EXISTS "books_insert_all" ON books;
CREATE POLICY "books_insert_all"
  ON books FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "books_update_all" ON books;
CREATE POLICY "books_update_all"
  ON books FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "books_delete_all" ON books;
CREATE POLICY "books_delete_all"
  ON books FOR DELETE USING (true);

-- ─── Storage bucket for cover images ─────────────────────────────────────────
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

DROP POLICY IF EXISTS "book_covers_public_read" ON storage.objects;
CREATE POLICY "book_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "book_covers_anon_insert" ON storage.objects;
CREATE POLICY "book_covers_anon_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "book_covers_anon_update" ON storage.objects;
CREATE POLICY "book_covers_anon_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "book_covers_anon_delete" ON storage.objects;
CREATE POLICY "book_covers_anon_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'book-covers');
