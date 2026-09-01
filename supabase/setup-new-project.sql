-- Authentic Islamic Books — full Supabase setup for a NEW project
-- Dashboard → SQL Editor → New query → paste ALL of this → Run
--
-- After this runs:
-- 1. Authentication → Users → Add user (or use auth.sql block below)
--    Email: admin@islamicdigitallibrary.com
--    Password: Admin@12345
--    ✓ Auto Confirm User
-- 2. Restart: npm run dev
-- 3. Admin login: /admin/login

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1 — Books table + storage (from schema.sql)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE book_status AS ENUM (
    'draft', 'published', 'needs_review', 'archived', 'processing', 'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2 — Shared team visibility + auth-only writes (from fix-shared-visibility.sql)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "books_select_all" ON books;
DROP POLICY IF EXISTS "books_select_own" ON books;
DROP POLICY IF EXISTS "books_select_created_by" ON books;
DROP POLICY IF EXISTS "Users can only see their own books" ON books;
DROP POLICY IF EXISTS "books_select_published" ON books;
DROP POLICY IF EXISTS "books_select_shared" ON books;

CREATE POLICY "books_select_shared"
  ON books FOR SELECT
  USING (
    status = 'published'
    OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "books_insert_all" ON books;
DROP POLICY IF EXISTS "books_insert_auth" ON books;
CREATE POLICY "books_insert_auth"
  ON books FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "books_update_all" ON books;
DROP POLICY IF EXISTS "books_update_auth" ON books;
CREATE POLICY "books_update_auth"
  ON books FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "books_delete_all" ON books;
DROP POLICY IF EXISTS "books_delete_auth" ON books;
CREATE POLICY "books_delete_auth"
  ON books FOR DELETE TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION books_set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS books_set_created_by ON books;
CREATE TRIGGER books_set_created_by
  BEFORE INSERT ON books
  FOR EACH ROW EXECUTE FUNCTION books_set_created_by();

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
