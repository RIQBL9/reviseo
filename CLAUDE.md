# CLAUDE.md

Guidance for future Claude Code sessions working on Reviseo — a personalised
GCSE revision platform. Read this before making structural changes.

## What this is

Students create an account, pick GCSE subjects + exam boards, set target
grades, then land on a personalised dashboard with flashcards, quizzes,
mastery tracking, XP, streaks, friends and a friends-only leaderboard.

**Design intent:** modern, colourful, gamified, "an app students want to come
back to" — not a school portal or admin dashboard. Every subject has a
consistent colour identity (see "Design system" below). Keep that bar when
adding UI.

## Stack & versions

- Next.js 16 (App Router, React Server Components by default)
- React 19
- TypeScript 7, strict mode
- Tailwind CSS v4 (CSS-first config — see `app/globals.css`, no `tailwind.config.ts`)
- Supabase: Postgres + Auth + Row Level Security, via `@supabase/ssr`
- Zod for input validation at every server boundary (forms, server actions)

Versions are pinned in `package.json` to what was current when this project
was scaffolded. This repo was built without a working `npm`/Node toolchain on
the machine that authored it — **nothing has been run, installed, type-checked
or built**. Treat the first `npm install && npm run typecheck && npm run build`
as a real verification step, not a formality, and fix whatever it surfaces.

## Architecture

```
app/
  (auth)/            sign up, log in, forgot/reset password — public routes
  onboarding/         post-signup wizard (year group → subjects → boards → grades)
  (app)/              everything behind auth: dashboard, subjects, revision,
                       practice, progress, friends, leaderboard, settings
  auth/callback/       Supabase email-link / OAuth code exchange
components/
  ui/                 design-system primitives (Button, Card, ProgressRing, …)
  landing/, auth/, onboarding/, dashboard/, subjects/, revision/, practice/,
  progress/, friends/, layout/, brand/   feature-scoped, non-reusable-by-design
lib/
  supabase/            browser client, server client, middleware session refresh
  data/                read-side query helpers (one per page/feature area)
  actions/             server actions that write data (revision, friends)
  types/database.ts     hand-written Supabase schema types (see below)
  subjects.ts, icon-map.ts, nav.ts, mastery.ts, xp.ts, streak.ts   domain logic
supabase/
  migrations/           schema + RLS, run in order, tracked in git
  seed.sql               demo content (NOT verified exam board content)
```

`app/(auth)/actions.ts` and `app/onboarding/actions.ts` are colocated next to
the routes that use them. `lib/actions/` holds server actions used from
multiple routes (revision sessions, friend requests).

## Database & types

`lib/types/database.ts` is a **hand-written** mirror of the SQL schema — there
was no working Supabase CLI available to run `supabase gen types typescript`
when this was built. If you have CLI access, regenerate it properly from the
live schema and diff against the hand-written version before replacing it.
If you change the schema, update both the migration file and this type file
in the same change.

Schema lives in `supabase/migrations/`, applied in filename order:
1. `0001_init_schema.sql` — enums, tables, indexes, triggers
2. `0002_rls_policies.sql` — RLS policies (every user-data table)

**Content hierarchy** (all DB-driven, nothing hard-coded in components):
`exam_boards` × `subjects` → `subject_exam_boards` (a "specification") →
`topics` (self-referencing `parent_topic_id`, so major topic → subtopic) →
`flashcards` / `questions`. A topic with no children is a "leaf" — that's
where flashcards/questions attach and where mastery is actually computed
(see `lib/data/topics.ts#getLeafTopics`). Parent topics roll up an average of
their children's mastery for display (`lib/data/subject-detail.ts`).

**`profiles` intentionally has no email column.** It's readable by any
authenticated user (RLS: `select using (true)`) so username search and
friends/leaderboards work without a service role — this only works because
there's no PII in the table. Don't add email/auth data to `profiles`; if you
need it, keep it in a separate table with owner-only RLS.

## Row Level Security

Every user-data table has RLS enabled with an `auth.uid() = user_id`-style
policy (or an `EXISTS` join for `quiz_answers`, which is owned indirectly via
`quiz_attempts`). Reference/content tables (`subjects`, `exam_boards`,
`subject_exam_boards`, `topics`, `flashcards`, `questions`) are publicly
readable and have **no** client-facing write policies — content is only
written via migrations/seed with the service role, which bypasses RLS.

Rules for future work:
- Never disable RLS to unblock a bug — fix the policy.
- Never import the service role key into client code or any file under
  `app/` that isn't a trusted, server-only admin script.
- New user-data tables need RLS enabled + an owner policy in the same PR as
  the table itself.

## Auth & route protection

`middleware.ts` → `lib/supabase/middleware.ts` refreshes the Supabase session
on every request and enforces:
- signed-out users can only reach `PUBLIC_PATHS` (landing, auth pages, `/auth/*`)
- signed-in users who haven't finished onboarding are redirected to `/onboarding`
- signed-in, onboarded users are redirected away from auth/onboarding screens

`app/(app)/layout.tsx` also does its own `auth.getUser()` + redirect as a
second line of defense for that route group — don't remove it just because
middleware already checks.

## XP, streaks & mastery — the anti-gaming rules

These live in `lib/xp.ts`, `lib/streak.ts`, `lib/mastery.ts` (pure functions)
and are applied from `lib/actions/revision.ts` (the only place that writes
XP/streak/mastery — go through it rather than writing `xp_events` or
`user_topic_progress` directly from a new feature).

- **XP** is capped per session and repeat sessions of the *same topic +
  activity type on the same day* earn diminishing XP (`repeatMultiplier` in
  `lib/xp.ts`) — prevents farming by re-opening the same flashcard deck.
- **Streaks** only extend when a revision session actually completes
  (`completeFlashcardSessionAction` / `completeQuizSessionAction`), never on
  login. `computeStreakUpdate` is a pure function — reuse it, don't
  reimplement streak math elsewhere.
- **Mastery** (`calculateMasteryScore`) blends accuracy (60%), volume (25%,
  capped) and recency (15%, decays after 7 days, zero after 30) — not just
  "did you mark it as known." `masteryLevelFromScore` maps the 0–100 score to
  the 5-state label (`not_started` → `mastered`) shown throughout the UI.

## Design system

Tokens are defined once in `app/globals.css` under `@theme` — brand colour,
semantic colours (success/warning/danger/info), gamification colours
(flame/xp), and one base+light+soft triplet per subject colour theme
(`--color-maths`, `--color-maths-light`, `--color-maths-soft`, etc.).

**Never build a Tailwind class with string interpolation**
(`` `bg-${theme}-soft` ``) — Tailwind's compiler statically scans source text
for literal class names, so interpolated ones silently produce no CSS. Always
go through `getSubjectTheme()` in `lib/subjects.ts`, which returns complete
literal class strings from a lookup map. Follow the same pattern (a `Record`
of full literal strings) for any other per-variant styling.

`lib/subjects.ts` (`SUBJECT_THEMES`) and `lib/icon-map.ts`
(`SUBJECT_ICON_MAP`) are the two places that turn a subject's DB row
(`color_theme`, `icon` — plain strings) into actual Tailwind classes and
Lucide components. Adding a subject in `supabase/seed.sql` with a new
`color_theme` requires adding matching tokens to `globals.css` +
`SUBJECT_THEMES`; a new `icon` value needs an entry in `SUBJECT_ICON_MAP`.

Icons are [lucide-react](https://lucide.dev), coloured per-context — not
monochrome throughout. Reusable primitives live in `components/ui/`; compose
those rather than restyling raw HTML elements.

## Conventions

- Server Components by default; add `"use client"` only where state/effects/
  browser APIs are needed (forms with `useActionState`, the flashcard/quiz
  session runners, nav active-states via `usePathname`).
- Data reads: a function per page/feature in `lib/data/`, taking
  `(supabase, userId, …)` and returning a typed, UI-ready shape — keeps pages
  thin and query logic testable/reusable.
- Data writes: Server Actions (`"use server"`), colocated with the route if
  only used there, else in `lib/actions/`. Validate input with Zod at the top
  of every action that takes user input.
- `next.config.ts` intentionally does **not** enable `typedRoutes` — the app
  builds many hrefs from template strings (`/subjects/${slug}`,
  `/practice/${topicId}`); typed routes would require casting all of them.
  Revisit only if you're willing to thread that through everywhere.
- Don't hard-code subject/topic/question content in components — it belongs
  in the database (seed data is clearly separated in `supabase/seed.sql` and
  explicitly marked as unverified placeholder content, not real spec content).

## What's scaffolded but intentionally not fully built (V1 scope)

The schema and RLS support these; the UI is deliberately minimal or absent so
V1 stayed polished rather than wide:

- **AI tutor / AI marking / AI-generated questions** — no code yet. When
  building it, constrain every prompt by the student's actual subject +
  exam board + topic (available from `lib/data/topic-detail.ts`) so it can't
  drift into non-GCSE content.
- **Achievements** — `user_achievements` table + RLS exist; nothing writes to
  it yet. Add achievement-unlock checks alongside the XP-awarding logic in
  `lib/actions/revision.ts`.
- **Leaderboard** is friends-only by design (`lib/data/leaderboard.ts`) — do
  not add a global leaderboard without an explicit product decision; it's a
  deliberate privacy choice, not an oversight.
- **Additional revision modes** (timed tests, blurting, fill-in-the-blank,
  match-the-answer, past papers, formula sheets) — `revision_activity_type`
  enum and `revision_sessions` table are shaped to add these without a schema
  rewrite; follow the flashcards/quiz pattern (session runner client
  component + a `lib/actions/` function that awards XP/streak/mastery
  through the existing pure helpers).

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build         # production build — run before considering any change done
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
```

Since this project has never been installed/built, **the first task in any
new session should be running all four** and fixing what breaks before
building new features on top.

## Environment variables

See `.env.example`. Only `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are required — the app is designed to never
need the service role key for normal operation (all writes go through RLS as
the authenticated user). Only add a service-role-key-dependent code path for
genuine admin/seeding scripts, run server-side only, never imported into
anything under `app/` that ships to the client.
