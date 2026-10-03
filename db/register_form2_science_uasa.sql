-- Add only this classroom to the existing protected Form 2 bundle.
-- Re-running registration does not overwrite an existing access decision.
insert into public.modules (id, title, syllabus, subject, bundle, grade_level, is_active, access_mode)
values ('spm-sci-f2-uasa-2024', 'UASA Sains Tingkatan 2 2024: Bilik Darjah', 'spm', 'science', 'spm_form2', 'Form2', true, 'protected')
on conflict (id) do nothing;
