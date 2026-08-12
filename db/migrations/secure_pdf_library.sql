-- Private PDF library for authenticated student, parent, guest, and admin accounts.

create table if not exists public.pdf_resources (
  id text primary key,
  title text not null,
  source_file text not null unique,
  storage_path text not null unique,
  syllabus text not null,
  level text not null default 'General',
  subject text not null,
  audience text not null check (audience in ('Student', 'Teacher')),
  document_type text not null,
  size_bytes bigint,
  pages integer,
  access_scope text not null default 'member' check (access_scope in ('member', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pdf_resources enable row level security;

drop policy if exists "Authenticated accounts can view student PDFs" on public.pdf_resources;
create policy "Authenticated accounts can view student PDFs"
on public.pdf_resources
for select
to authenticated
using (
  is_active
  and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  and exists (
    select 1
    from public.user_profiles
    where user_profiles.id = (select auth.uid())
  )
  and (
    access_scope = 'member'
    or exists (
      select 1
      from public.user_profiles
      where user_profiles.id = (select auth.uid())
        and user_profiles.tier = 'admin'
    )
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-pdfs', 'course-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated accounts can read allowed course PDFs" on storage.objects;
create policy "Authenticated accounts can read allowed course PDFs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-pdfs'
  and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  and exists (
    select 1
    from public.user_profiles
    where user_profiles.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.pdf_resources
    where pdf_resources.storage_path = storage.objects.name
      and pdf_resources.is_active
      and (
        pdf_resources.access_scope = 'member'
        or exists (
          select 1
          from public.user_profiles
          where user_profiles.id = (select auth.uid())
            and user_profiles.tier = 'admin'
        )
      )
  )
);
