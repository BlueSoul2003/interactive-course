# SPM Form 4 Additional Mathematics Live Quiz

## What Is Included

- 40 verified multiple-choice questions across 10 Form 4 chapters
- Teacher-created waiting rooms with a six-character join code, link, and QR code
- Optional question and answer shuffling
- Timed or unlimited sessions with late-join control
- Anonymous student entry using name, optional student ID, and session code
- Same-device attempt recovery
- Live teacher monitoring, answer hiding, chapter/question analysis, CSV export, and attempt reopening
- English and Simplified Chinese interface

## One-Time Supabase Setup

Apply these migrations in order:

1. `db/migrations/addmaths_live_quiz.sql`
2. `db/migrations/addmaths_live_quiz_hardening.sql`

Then open **Supabase Dashboard > Authentication > Sign In / Providers** and enable
**Allow anonymous sign-ins**. The quiz cannot create temporary student sessions until
this switch is enabled.

The migration automatically grants the quiz `admin` role to existing Interactive
Course accounts whose `user_profiles.tier` is `admin`.

To grant an existing account teacher access, run:

```sql
INSERT INTO public.quiz_staff (user_id, role, created_by)
SELECT target.id, 'teacher', admin_staff.user_id
FROM public.user_profiles AS target
CROSS JOIN LATERAL (
    SELECT user_id
    FROM public.quiz_staff
    WHERE role = 'admin'
    ORDER BY created_at
    LIMIT 1
) AS admin_staff
WHERE LOWER(target.email) = LOWER('teacher@example.com')
ON CONFLICT (user_id) DO UPDATE SET role = 'teacher';
```

Replace `teacher@example.com` with the teacher's existing Interactive Course account.

## Access Rules

- Students do not need an Interactive Course account.
- Teachers can only read and manage sessions they created.
- Quiz admins can read and manage all sessions.
- Answers and explanations are stored in Supabase and are not shipped in the public
  student question file.
- Each session accepts up to 50 students.

## Verification

Run:

```bash
npm run verify:addmaths-live-quiz
npm run verify:navigation
```

The first command checks the 40-question structure, verified answer key, public answer
separation, database security contract, Supabase key consistency, and portal entry.
