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
  'igcse-y4-sci-arclight-grid-crisis',
  'Arclight Grid Crisis',
  'igcse',
  'science',
  'igcse_y4_science',
  'Year4',
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
