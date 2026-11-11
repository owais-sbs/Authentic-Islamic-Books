-- ─────────────────────────────────────────────────────────────────────────────
-- Optional: allow anonymous readers to create short-lived signed URLs for
-- private book-attachments (audio / supplemental PDFs).
--
-- Run AFTER admin-review-enhancements.sql if public readers should open
-- attachments without signing in.
--
-- Security notes:
-- - Bucket remains public = false (no permanent public CDN URLs).
-- - Anon SELECT is required for Storage createSignedUrl to succeed.
-- - Paths use UUIDs; prefer signed URLs in the app (AttachmentBlock).
-- - Do NOT set the bucket to public.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "book_attachments_anon_select" ON storage.objects;
CREATE POLICY "book_attachments_anon_select"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'book-attachments');
