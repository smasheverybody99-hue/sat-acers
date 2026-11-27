# SAT Acers — Ace it. Every day.

A free Digital SAT prep site: 5 full-length mocks, 500+ original questions with explanations, a Mistake Log with spaced review, and a daily streak.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

For sign-in and cloud sync, copy `.env.example` to `.env.local` and fill in the Supabase values. Without them, the site still works and saves progress in the browser only.

## Pages

| Path | What |
|---|---|
| `/` | Landing page |
| `/dashboard` | Estimated score, streak, daily goal, recent mocks, mastery by domain |
| `/practice` | Question bank: filter by section, domain, skill, difficulty and status; A–D and Enter shortcuts |
| `/mock`, `/mock/[id]` | Bluebook-style mocks: modules, timer, Mark for Review, highlighter, answer eliminator, Desmos, reference sheet, break, score estimate and review. Mocks live in `data/mocks.json` |
| `/mistakes` | Mistake Log: missed questions come back after 1, 3 and 7 days |
| `/official` | Links to official College Board and Khan Academy resources |
| `/login` | Email magic link and Google sign-in (Supabase) |
| `/privacy`, `/terms` | Privacy Policy and Terms of Service |

Progress is stored in `localStorage` (`lib/progress.ts`). When signed in, `lib/sync.ts` merges it with the `user_data` table in Supabase (schema: `supabase/schema.sql`).

## Adding questions

All questions are in `data/questions.json`. To import many at once from CSV or JSON:

```bash
npm run import -- questions.csv --dry-run   # validate only
npm run import -- questions.csv             # add to the bank (same id = update)
npm run import -- questions.json --replace  # replace the whole bank
```

See `scripts/sample-import.csv` for the columns. The script validates each row (section, domain name, answer within the choices, etc.) and reports errors.

- `section`: `math` or `rw`
- `domain`: Math — `Algebra`, `Advanced Math`, `Problem-Solving and Data Analysis`, `Geometry and Trigonometry`; R&W — `Information and Ideas`, `Craft and Structure`, `Expression of Ideas`, `Standard English Conventions`
- `difficulty`: `easy` / `medium` / `hard`
- `type`: `mcq` (A–D) or `spr` (student-produced response)
- `answer`: `A`–`D` for mcq; for spr, accepted answers separated by `|`: `2.5|5/2`
- Graphs: the `figure` field (`Figure` in `lib/types.ts`). Tables: lines like `A — B — C` in the text become a table.
- Math notation: `a/b`, `x^(3/2)`, `√(x + 1)` render automatically.

## Deploy

Pushing to `main` deploys to Vercel. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and (optionally) `NEXT_PUBLIC_GOOGLE_LOGIN=1` in the Vercel project settings.
