# Questboard

Questboard is a personal daily-quests and activity-log app built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and **publishable** API key. In the Supabase dashboard, find these in **Connect** or **Settings → API Keys**. Do not put a secret or `service_role` key in a `NEXT_PUBLIC_` variable.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. In the Supabase SQL Editor for that same project, run [`supabase/schema.sql`](supabase/schema.sql). It creates the quest, completion, and daily-note tables, row-level security policies, and the daily completion function.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create an account or sign in, then add or complete a quest. A quest can be completed once per Singapore calendar day.

`.env.local` is ignored by Git. Keep it that way; only the placeholder `.env.example` belongs in the repository.

## Current scope

- Quests, daily completions, and daily notes are stored in Supabase for the signed-in account.
- The achievements page is still a prototype: skill ratings and custom achievements are held only in page state and are not saved to Supabase yet.
- The profile name and image are currently static. Account-based profile details and persisted achievements are planned follow-up work.

## Useful commands

```bash
npm run dev    # start local development
npm run lint   # run ESLint
npm run build  # create a production build
```
