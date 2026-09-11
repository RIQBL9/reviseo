-- Reviseo Row Level Security policies.
-- Every table that holds user data is locked to auth.uid(). Reference/content
-- tables (subjects, exam_boards, topics, flashcards, questions) are readable
-- by anyone but only writable via migrations/seed (service role bypasses RLS).

alter table profiles enable row level security;
alter table subjects enable row level security;
alter table exam_boards enable row level security;
alter table subject_exam_boards enable row level security;
alter table topics enable row level security;
alter table flashcards enable row level security;
alter table questions enable row level security;
alter table user_subjects enable row level security;
alter table user_topic_progress enable row level security;
alter table revision_sessions enable row level security;
alter table quiz_attempts enable row level security;
alter table quiz_answers enable row level security;
alter table flashcard_reviews enable row level security;
alter table xp_events enable row level security;
alter table user_achievements enable row level security;
alter table friendships enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- Readable by any authenticated user (needed for username search,
-- friends and leaderboards) but contains no email/auth secrets.
-- Only the owner can insert/update/delete their own row.
-- ---------------------------------------------------------------------

create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Row creation happens via the handle_new_user() trigger (security definer),
-- so no client-facing insert policy is needed or granted.

-- ---------------------------------------------------------------------
-- reference / content data: readable by everyone, writable by nobody
-- (content is managed through migrations + seed data with the service role)
-- ---------------------------------------------------------------------

create policy "subjects are publicly readable"
  on subjects for select
  to anon, authenticated
  using (true);

create policy "exam boards are publicly readable"
  on exam_boards for select
  to anon, authenticated
  using (true);

create policy "subject exam boards are publicly readable"
  on subject_exam_boards for select
  to anon, authenticated
  using (true);

create policy "topics are publicly readable"
  on topics for select
  to anon, authenticated
  using (true);

create policy "flashcards are publicly readable"
  on flashcards for select
  to authenticated
  using (true);

create policy "questions are publicly readable"
  on questions for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- user_subjects
-- ---------------------------------------------------------------------

create policy "users manage their own subject selections"
  on user_subjects for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- user_topic_progress
-- ---------------------------------------------------------------------

create policy "users manage their own topic progress"
  on user_topic_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- revision_sessions
-- ---------------------------------------------------------------------

create policy "users manage their own revision sessions"
  on revision_sessions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- quiz_attempts / quiz_answers
-- ---------------------------------------------------------------------

create policy "users manage their own quiz attempts"
  on quiz_attempts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own quiz answers"
  on quiz_answers for all
  to authenticated
  using (
    exists (
      select 1 from quiz_attempts
      where quiz_attempts.id = quiz_answers.quiz_attempt_id
        and quiz_attempts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from quiz_attempts
      where quiz_attempts.id = quiz_answers.quiz_attempt_id
        and quiz_attempts.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- flashcard_reviews
-- ---------------------------------------------------------------------

create policy "users manage their own flashcard reviews"
  on flashcard_reviews for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- xp_events (append-only ledger: no update/delete policies at all)
-- ---------------------------------------------------------------------

create policy "users read their own xp events"
  on xp_events for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert their own xp events"
  on xp_events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- user_achievements (append-only: earned via server logic, never edited)
-- ---------------------------------------------------------------------

create policy "users read their own achievements"
  on user_achievements for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert their own achievements"
  on user_achievements for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- friendships
-- Either party can see a friendship. Only the requester can create one
-- (and not with themselves). Either party can update (accept/decline) or
-- delete (remove/cancel) a friendship they are part of.
-- ---------------------------------------------------------------------

create policy "users read friendships they are part of"
  on friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "users send friend requests"
  on friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "users respond to friendships they are part of"
  on friendships for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "users remove friendships they are part of"
  on friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
