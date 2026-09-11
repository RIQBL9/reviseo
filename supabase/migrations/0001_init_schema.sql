-- Reviseo initial schema
-- Enums, tables, indexes and triggers. RLS policies live in 0002_rls_policies.sql.

create extension if not exists pgcrypto;

-- =========================================================================
-- ENUMS
-- =========================================================================

create type year_group as enum ('year_10', 'year_11');

create type mastery_level as enum (
  'not_started',
  'learning',
  'improving',
  'confident',
  'mastered'
);

create type question_type as enum ('multiple_choice', 'short_answer');

create type revision_activity_type as enum ('flashcards', 'quiz', 'practice_questions');

create type friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');

create type flashcard_confidence as enum ('low', 'medium', 'high');

-- =========================================================================
-- PROFILES
-- One row per Supabase Auth user. Deliberately holds no email/auth secrets
-- so it can be safely readable by other authenticated users (friend search,
-- leaderboards) without leaking private account information.
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  year_group year_group,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  daily_xp_goal integer not null default 50,
  onboarding_completed boolean not null default false,
  onboarding_step smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint daily_xp_goal_positive check (daily_xp_goal > 0)
);

comment on table profiles is 'Public-safe profile data linked 1:1 to auth.users. No email/PII beyond display name.';

-- =========================================================================
-- REFERENCE DATA: subjects, exam boards, and the specifications that link them
-- =========================================================================

create table subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text not null,
  color_theme text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table exam_boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- A "specification" — the actual examinable combination of a subject + board.
-- Only rows that exist here should ever be offered during onboarding.
create table subject_exam_boards (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  exam_board_id uuid not null references exam_boards (id) on delete cascade,
  specification_code text,
  specification_url text,
  created_at timestamptz not null default now(),
  unique (subject_id, exam_board_id)
);

create index idx_subject_exam_boards_subject on subject_exam_boards (subject_id);
create index idx_subject_exam_boards_board on subject_exam_boards (exam_board_id);

-- =========================================================================
-- SPECIFICATION CONTENT TREE: topics -> subtopics, flashcards, questions
-- =========================================================================

create table topics (
  id uuid primary key default gen_random_uuid(),
  subject_exam_board_id uuid not null references subject_exam_boards (id) on delete cascade,
  parent_topic_id uuid references topics (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_exam_board_id, slug)
);

create index idx_topics_spec on topics (subject_exam_board_id);
create index idx_topics_parent on topics (parent_topic_id);

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_flashcards_topic on flashcards (topic_id);

create table questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete cascade,
  question_type question_type not null default 'multiple_choice',
  prompt text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  difficulty smallint not null default 2,
  created_at timestamptz not null default now(),
  constraint difficulty_range check (difficulty between 1 and 3),
  constraint mcq_has_options check (
    question_type <> 'multiple_choice' or jsonb_typeof(options) = 'array'
  )
);

create index idx_questions_topic on questions (topic_id);

-- =========================================================================
-- USER <-> CONTENT: subject selection, progress/mastery
-- =========================================================================

create table user_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  exam_board_id uuid not null references exam_boards (id) on delete cascade,
  target_grade smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, subject_id),
  constraint target_grade_range check (target_grade is null or target_grade between 1 and 9)
);

create index idx_user_subjects_user on user_subjects (user_id);

create table user_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  mastery_score smallint not null default 0,
  mastery_level mastery_level not null default 'not_started',
  questions_answered integer not null default 0,
  questions_correct integer not null default 0,
  flashcards_reviewed integer not null default 0,
  last_revised_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id),
  constraint mastery_score_range check (mastery_score between 0 and 100)
);

create index idx_user_topic_progress_user on user_topic_progress (user_id);
create index idx_user_topic_progress_topic on user_topic_progress (topic_id);

-- =========================================================================
-- REVISION ACTIVITY: sessions, quiz attempts/answers, flashcard reviews
-- =========================================================================

create table revision_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  activity_type revision_activity_type not null,
  items_total integer not null default 0,
  items_correct integer not null default 0,
  duration_seconds integer not null default 0,
  xp_earned integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_revision_sessions_user on revision_sessions (user_id, started_at desc);
create index idx_revision_sessions_topic on revision_sessions (topic_id);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  revision_session_id uuid not null references revision_sessions (id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_quiz_attempts_user on quiz_attempts (user_id);
create index idx_quiz_attempts_session on quiz_attempts (revision_session_id);

create table quiz_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_attempt_id uuid not null references quiz_attempts (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  user_answer text,
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_quiz_answers_attempt on quiz_answers (quiz_attempt_id);

create table flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  flashcard_id uuid not null references flashcards (id) on delete cascade,
  revision_session_id uuid references revision_sessions (id) on delete cascade,
  confidence flashcard_confidence not null,
  reviewed_at timestamptz not null default now()
);

create index idx_flashcard_reviews_user on flashcard_reviews (user_id);
create index idx_flashcard_reviews_card on flashcard_reviews (flashcard_id);

-- =========================================================================
-- XP, ACHIEVEMENTS, SOCIAL
-- =========================================================================

create table xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  revision_session_id uuid references revision_sessions (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_xp_events_user_time on xp_events (user_id, created_at desc);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create index idx_user_achievements_user on user_achievements (user_id);

create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles (id) on delete cascade,
  addressee_id uuid not null references profiles (id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_friendship check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index idx_friendships_requester on friendships (requester_id, status);
create index idx_friendships_addressee on friendships (addressee_id, status);

-- =========================================================================
-- TRIGGERS
-- =========================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger trg_user_subjects_updated_at before update on user_subjects
  for each row execute function set_updated_at();

create trigger trg_user_topic_progress_updated_at before update on user_topic_progress
  for each row execute function set_updated_at();

create trigger trg_friendships_updated_at before update on friendships
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new Supabase Auth user is created.
-- Username is a placeholder derived from the user id; the onboarding flow
-- prompts the student to choose their real username and display name.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'student_' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
