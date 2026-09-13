-- Add only Bab 8; retain the existing Form 3 access boundary.
insert into public.modules (id, title, syllabus, subject, bundle, grade_level, is_active, access_mode)
values ('spm-sci-f3-bab8-keradioaktifan', 'Bab 8: Keradioaktifan (Radioactivity)', 'spm', 'science', 'spm_form3', 'Form3', true, 'protected')
on conflict (id) do nothing;
