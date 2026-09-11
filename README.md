# Reviseo

A personalised GCSE revision platform. Students pick their subjects and exam
boards, revise with flashcards and quizzes, and track progress toward their
target grades.

> **Status:** early V1 foundation — see [CLAUDE.md](./CLAUDE.md) for
> architecture notes and what's implemented vs. scaffolded for later.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In the SQL Editor, run the migrations in order:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
3. Optionally run `supabase/seed.sql` to load demo subjects, exam boards and
   a full AQA Biology topic tree with flashcards/questions, so the app has
   something to show immediately.
4. Copy your Project URL and `anon` public key from Settings → API into
   `.env.local` (see `.env.example`).

Row Level Security is enabled on every user-data table — see
`supabase/migrations/0002_rls_policies.sql` for the policies.

## Scripts

```bash
npm run dev        # start the dev server
npm run build       # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

## Project structure

See [CLAUDE.md](./CLAUDE.md) for the full architecture write-up, conventions
and what's intentionally scaffolded-but-not-built-out yet (friends,
leaderboards, AI tutor, advanced revision modes).
