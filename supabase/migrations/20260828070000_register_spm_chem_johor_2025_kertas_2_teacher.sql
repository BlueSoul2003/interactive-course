insert into public.modules (
  id,
  title,
  syllabus,
  subject,
  bundle,
  grade_level,
  is_active,
  access_mode
)
values (
  'spm-chem-f5-johor-2025-k2-teacher',
  'Johor 2025 Kimia Kertas 2 Teacher Slides',
  'spm',
  'chemistry',
  'spm_form5',
  'Form5',
  true,
  'protected'
)
on conflict (id) do update
set title = excluded.title,
    syllabus = excluded.syllabus,
    subject = excluded.subject,
    bundle = excluded.bundle,
    grade_level = excluded.grade_level,
    is_active = excluded.is_active,
    access_mode = excluded.access_mode;
