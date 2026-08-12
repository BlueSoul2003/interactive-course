create table if not exists public.friendship_class_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_session_id uuid not null references public.friendship_quiz_sessions(id) on delete cascade,
  class_code text not null unique check (class_code ~ '^[A-Z2-9]{8}$'),
  title text not null check (char_length(title) between 2 and 80),
  status text not null default 'live' check (status in ('live', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.friendship_quiz_attempts (
  id uuid primary key,
  quiz_session_id uuid not null references public.friendship_quiz_sessions(id) on delete cascade,
  class_session_id uuid references public.friendship_class_sessions(id) on delete set null,
  student_name text not null check (char_length(student_name) between 1 and 80),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  score integer check (score between 0 and 30),
  answered_count integer not null default 0 check (answered_count between 0 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.friendship_quiz_attempt_answers (
  attempt_id uuid not null references public.friendship_quiz_attempts(id) on delete cascade,
  question_no integer not null check (question_no between 1 and 30),
  selected_index integer not null check (selected_index between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_no)
);

create index if not exists friendship_class_sessions_quiz_status_idx
  on public.friendship_class_sessions (quiz_session_id, status, created_at desc);

create index if not exists friendship_quiz_attempts_class_updated_idx
  on public.friendship_quiz_attempts (class_session_id, updated_at desc);

create index if not exists friendship_quiz_attempts_quiz_updated_idx
  on public.friendship_quiz_attempts (quiz_session_id, updated_at desc);

alter table public.friendship_class_sessions enable row level security;
alter table public.friendship_quiz_attempts enable row level security;
alter table public.friendship_quiz_attempt_answers enable row level security;

revoke all on public.friendship_class_sessions from anon, authenticated;
revoke all on public.friendship_quiz_attempts from anon, authenticated;
revoke all on public.friendship_quiz_attempt_answers from anon, authenticated;

grant all on public.friendship_class_sessions to service_role;
grant all on public.friendship_quiz_attempts to service_role;
grant all on public.friendship_quiz_attempt_answers to service_role;

update public.modules set title = 'Self-Discovery & Meaningful Conversations', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-discovery-journey';
update public.modules set title = 'The Startup Communication Lab', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-teen-ceo';
update public.modules set title = 'AI at Work', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-ai-cofounder';
update public.modules set title = 'Pricing Psychology & Business English', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-pricing-strategy';
update public.modules set title = 'Negotiation & Tactical Communication', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-master-negotiator';
update public.modules set title = 'Financial Literacy & Life Decisions', syllabus = 'university', subject = 'adult_english', bundle = 'adult_english', grade_level = 'Adult' where id = 'uec-en-rich-teen-simulator';

insert into public.modules (id, title, syllabus, subject, bundle, grade_level, is_active)
values ('adult-en-friendship', 'The Purpose of Friendship', 'university', 'adult_english', 'adult_english', 'Adult', true)
on conflict (id) do update set
  title = excluded.title,
  syllabus = excluded.syllabus,
  subject = excluded.subject,
  bundle = excluded.bundle,
  grade_level = excluded.grade_level,
  is_active = excluded.is_active;
