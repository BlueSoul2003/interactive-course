-- Add only this extension to the existing Year 4 Science access bundle.
-- Re-running this registration does not overwrite an existing access decision.
insert into public.modules (id, title, syllabus, subject, bundle, grade_level, is_active, access_mode)
values ('igcse-y4-sci-vanishing-crystal', 'The Vanishing Crystal', 'igcse', 'science', 'igcse_y4_science', 'Year4', true, 'protected')
on conflict (id) do nothing;
