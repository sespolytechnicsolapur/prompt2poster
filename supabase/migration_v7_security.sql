-- Migration v7: Atomic score_edit_log append function + tighter RLS policies
--
-- Fixes the read-modify-write race condition in updateSubmissionScores
-- by providing a Postgres function that atomically appends to the JSONB array.

CREATE OR REPLACE FUNCTION append_score_edit_log(
  submission_id UUID,
  new_entry JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE submissions
  SET score_edit_log = COALESCE(score_edit_log, '[]'::jsonb) || jsonb_build_array(new_entry)
  WHERE id = submission_id;
END;
$$;

-- ============================================================
-- Tightened RLS Policies
-- ============================================================
-- NOTE: These policies tighten access but still allow the anon key
-- to perform operations needed by the app (read all, insert submissions).
-- Admin operations (DELETE, bulk UPDATE) should ideally use a
-- service_role key or be done through the Supabase dashboard.

-- Contestants: public read, no public write (admin imports via service key or dashboard)
DROP POLICY IF EXISTS "Allow public write access to contestants" ON contestants;

-- Topics: public read, restricted write (keep existing write policy for now
-- since visibility toggles go through the anon key from the client)
-- NOTE: If you move admin ops to a server with service_role key, tighten this too.

-- Submissions: allow insert (contestants submit), allow update (score edits),
-- but restrict DELETE to prevent casual deletion via REST API
DROP POLICY IF EXISTS "Allow public delete to submissions" ON submissions;
