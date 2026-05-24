-- ============================================================================
-- db/migrations/feedback_system.sql
--
-- Sets up the user_feedback table, RLS policies, and indices
-- to track bug reports, subject requests, and general suggestions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_feedback (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
    fullname      TEXT,
    email         TEXT,
    feedback_type TEXT         NOT NULL CHECK (feedback_type IN ('bug_report', 'subject_request', 'general')),
    syllabus      TEXT,
    subject       TEXT,
    details       TEXT         NOT NULL,
    status        TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies before creating
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.user_feedback;

-- 1. Allow public inserts (anyone can submit feedback, logged-in or guest)
CREATE POLICY "Anyone can insert feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (true);

-- 2. Allow admins to select, update, and delete feedback entries
CREATE POLICY "Admins can manage feedback"
ON public.user_feedback
FOR ALL
USING (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Create index for faster admin lookups by status/created_at
CREATE INDEX IF NOT EXISTS user_feedback_status_created_idx ON public.user_feedback (status, created_at DESC);
