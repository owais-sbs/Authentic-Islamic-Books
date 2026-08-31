-- ─────────────────────────────────────────────────────────────────────────────
-- Shared book visibility for all authenticated team members
-- Run in Supabase Dashboard → SQL Editor
--
-- Root cause this fixes: team members could not see each other's books when
-- data lived only in each browser's localStorage. Once books are saved to
-- Supabase, these policies ensure EVERY authenticated admin can SELECT all
-- books (not only their own). Creator tracking is optional and does NOT
-- restrict visibility.
--
-- Does NOT disable RLS.
-- Does NOT filter SELECT by created_by / user_id.
-- ─────────────────────────────────────────────────────────────────────────────

-- Optional audit column (safe if already exists). Visibility is NOT based on it.
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Drop any creator-scoped SELECT policies if present from older experiments
DROP POLICY IF EXISTS "books_select_own" ON books;
DROP POLICY IF EXISTS "books_select_created_by" ON books;
DROP POLICY IF EXISTS "Users can only see their own books" ON books;

-- Replace select policies with shared team visibility
DROP POLICY IF EXISTS "books_select_all" ON books;
DROP POLICY IF EXISTS "books_select_published" ON books;
DROP POLICY IF EXISTS "books_select_shared" ON books;

-- Public/anon: published books only (main website)
-- Authenticated team: ALL books (draft, needs_review, published, archived)
CREATE POLICY "books_select_shared"
  ON books FOR SELECT
  USING (
    status = 'published'
    OR auth.role() = 'authenticated'
  );

-- Ensure authenticated team can insert/update/delete (shared admin pool)
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

-- Auto-stamp created_by on insert when missing (audit only — not used for SELECT)
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
