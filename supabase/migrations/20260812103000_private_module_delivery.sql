-- Phase 3: private package registry for protected teaching modules.

create table if not exists public.module_packages (
  module_id text primary key references public.modules(id) on delete cascade,
  bucket_id text not null,
  storage_path text not null,
  content_type text not null default 'text/html',
  package_version integer not null default 1 check (package_version > 0),
  sha256_hex text not null check (sha256_hex ~ '^[0-9a-f]{64}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, storage_path)
);

comment on table public.module_packages is
  'Server-only mapping from canonical module IDs to private Storage packages.';

alter table public.module_packages enable row level security;

revoke all on public.module_packages from public, anon, authenticated;
grant all on public.module_packages to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'protected-course-modules',
  'protected-course-modules',
  false,
  10485760,
  array['text/html']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.module_packages (
  module_id,
  bucket_id,
  storage_path,
  content_type,
  package_version,
  sha256_hex,
  is_active
)
values (
  'adult-en-friendship',
  'protected-course-modules',
  'adult-en-friendship/v1/index.html',
  'text/html',
  1,
  'b959595a1218dec5949f55356c95dd324578420b79f479ebb360782f7eaca58d',
  true
)
on conflict (module_id) do update
set bucket_id = excluded.bucket_id,
    storage_path = excluded.storage_path,
    content_type = excluded.content_type,
    package_version = excluded.package_version,
    sha256_hex = excluded.sha256_hex,
    is_active = excluded.is_active,
    updated_at = now();
