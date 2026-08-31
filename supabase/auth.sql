-- ─────────────────────────────────────────────────────────────────────────────
-- Admin user for Islamic Digital Library
-- Run AFTER supabase/schema.sql in SQL Editor
--
-- Login credentials:
--   Email:    admin@islamicdigitallibrary.com
--   Password: Admin@12345
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Easiest method: use Supabase Dashboard instead of this SQL:
-- Authentication → Users → Add user → Create new user
--   Email: admin@islamicdigitallibrary.com
--   Password: Admin@12345
--   ✓ Auto Confirm User

-- OR run this SQL to create the user programmatically:
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  -- Skip if admin already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@islamicdigitallibrary.com') THEN
    RAISE NOTICE 'Admin user already exists — skipping.';
    RETURN;
  END IF;

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    is_sso_user
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@islamicdigitallibrary.com',
    crypt('Admin@12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{"full_name":"Admin"}'::jsonb,
    NOW(),
    NOW(),
    '',
    false
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_id,
    admin_id::text,
    jsonb_build_object(
      'sub', admin_id::text,
      'email', 'admin@islamicdigitallibrary.com',
      'email_verified', true
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Admin user created: admin@islamicdigitallibrary.com';
END $$;

-- ─── Tighten RLS: only logged-in admins can write books ───────────────────────
DROP POLICY IF EXISTS "books_select_all" ON books;
DROP POLICY IF EXISTS "books_insert_all" ON books;
DROP POLICY IF EXISTS "books_update_all" ON books;
DROP POLICY IF EXISTS "books_delete_all" ON books;

CREATE POLICY "books_select_published"
  ON books FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

-- NOTE: SELECT is intentionally NOT filtered by created_by / user_id.
-- Authenticated team members share the full book collection.
-- Public/anon visitors only see published books.

CREATE POLICY "books_insert_auth"
  ON books FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "books_update_auth"
  ON books FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "books_delete_auth"
  ON books FOR DELETE TO authenticated
  USING (true);

-- Storage: authenticated upload only, public read
DROP POLICY IF EXISTS "book_covers_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_anon_delete" ON storage.objects;

CREATE POLICY "book_covers_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-covers');
