-- Same protected Form 2 bundle as paper 1; no changes to existing grants.
insert into public.modules (id, title, syllabus, subject, bundle, grade_level, is_active, access_mode)
values ('spm-sci-f2-uasa-pelangi', 'Form 2 Science: Pelangi UASA · English + 简体中文', 'spm', 'science', 'spm_form2', 'Form2', true, 'protected')
on conflict (id) do nothing;
