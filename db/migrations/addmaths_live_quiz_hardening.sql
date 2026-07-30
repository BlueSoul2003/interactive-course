-- Follow-up hardening for the SPM Form 4 Additional Mathematics live quiz.

BEGIN;

-- Trigger functions are invoked by PostgreSQL and do not need API execution grants.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Cover foreign keys used for cleanup and staff/attempt ownership lookups.
CREATE INDEX IF NOT EXISTS quiz_staff_created_by_idx
    ON public.quiz_staff (created_by)
    WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS quiz_participants_auth_user_idx
    ON public.quiz_participants (auth_user_id);

CREATE INDEX IF NOT EXISTS quiz_attempt_events_actor_user_idx
    ON public.quiz_attempt_events (actor_user_id)
    WHERE actor_user_id IS NOT NULL;

COMMIT;
