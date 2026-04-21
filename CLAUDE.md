# Pitcher Tracker — Claude Context

> **Maintenance note for Claude:** Keep this file up to date as the codebase evolves. After adding new files, data model changes, schema changes, or significant design decisions, update the relevant section here before committing.

## Stack
- **React 18 + TypeScript** via Vite
- **moment.js** for date handling (no native Date manipulation)
- **Supabase** for auth + cloud persistence (Postgres + RLS). No localStorage.
- **Mantine 8** for all form controls, buttons, modals, tabs, paper, cards, dates, notifications
  - `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/dates`, `@mantine/notifications`
  - Global theme in `main.tsx`: `forceColorScheme="dark"`, primary color `indigo`, custom `accent` palette, default Modal transition `fade-up` 250ms
- **@tabler/icons-react** for iconography
- **dayjs** (peer dep of @mantine/dates)
- Custom global CSS (`src/style.css`) only for app-specific layout not covered by Mantine: pills, progress dots, schedule row layout, onboarding/login screen wrappers
- No routing library — tab state lives in `App.tsx`

## Project Structure
```
src/
  App.tsx              # Root — auth state, Supabase session, top-level data
  main.tsx             # ReactDOM entry. MantineProvider + Notifications + theme
  style.css            # Remaining app-specific CSS (layout, pills, dots)
  types.ts             # Day, Throwing, Schedule, ScheduleDay, GymExercise, GymPlan, GymEntry, GymProgress
  constants.ts         # MOVEMENT_KEYS, MOVEMENT_LABELS, DAY_NAMES, DEFAULT_SCHEDULE, INTENSITY_OPTIONS
  throwingExercises.ts # JAVELIN_PROGRAM and POST_THROW_RECOVERY exercise definitions
  movementExercises.ts # Exercise lists per movement category (shown in info modal)
  utils/
    dates.ts           # moment.js helpers
    supabase.ts        # Supabase client singleton (uses VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY)
    storage.ts         # All Supabase queries: loadAllUserData, saveStartDate, saveScheduleDay,
                       # saveDay, saveGymPlanDay, appendGymEntry, deleteGymEntry
    errorBus.ts        # reportError() → Mantine notifications.show (auto-close 5s)
    initDay.ts         # Factory to create a blank Day for a given ISO date + Schedule
  components/
    LoginScreen.tsx    # Sign in (email+password), Create account wizard, OTP code fallback
    Onboarding.tsx     # 3-step wizard: Name → Schedule → Program start date
    SettingsModal.tsx  # Start date (DatePickerInput) + Schedule editor + Account (change password / sign out)
    WeekTab.tsx        # Week nav + day list
    WeeklySummary.tsx  # 3-stat summary card (throws, movement rate, recovery rate)
    DayCard.tsx        # Paper-wrapped collapsible day with pills + progress dots
    MovementSection.tsx, ThrowingSection.tsx, GymSection.tsx
                       # Inner Papers inside DayCard (bg="dark.6" for contrast)
    GymTab.tsx         # Gym plan: Paper day cards, per-exercise rows, ProgressModal (Mantine Modal)
```

## Data Model (Supabase Postgres, all RLS'd by `auth.uid() = user_id`)

### `profiles`
- `user_id uuid PK → auth.users`
- `start_date date` — program start Monday
- `created_at`, `updated_at` (trigger)

### `schedule_days` (weekly pitching/gym schedule)
- `user_id uuid` + `day_of_week smallint (0=Mon..6=Sun)` composite PK
- `throw_type text` — 'javelin_longtoss' | 'mound_bullpen' | 'rest'
- `gym boolean` — is this a gym day
- Seeded with `DEFAULT_SCHEDULE` on first login

### `training_days`
- `id uuid`, `user_id`, `date date`, UNIQUE(user_id, date)
- Flat: `spine/shoulders/hips/balance/core/inversions boolean`, `throw_type`, `javelin_done`, `working_throws`, `long_toss_max_distance numeric(5,1)`, `intensity`, `post_throw_recovery`, `gym_done`
- CHECK constraints enforce enum-like values for `throw_type` and `intensity`

### `exercises` (catalog — one row per unique exercise per user)
- `id text PK` (client-generated UUID-ish string)
- `user_id`, `movement text` (length 1–100), `sets text?`

### `plan_days` (junction — which exercises appear on which day)
- Composite PK `(user_id, day_of_week, exercise_id)` → allows **same exercise on multiple days**
- `exercise_id text REFERENCES exercises(id) ON DELETE CASCADE`
- `sort_order smallint`

### `gym_entries` (progress history)
- `id uuid PK`, `exercise_id text FK → exercises(id)`, `user_id`
- `kg numeric(6,2)`, `rep_delta smallint` (signed), `created_at` (used for ordering)
- History is shared across days because it keys off `exercise_id`, not a per-day row

## Client-side types

### `GymExercise`
```ts
interface GymExercise { id: string; movement: string; sets?: string }
```
Display: `"Lateral raise"` on top line, `"4x10"` smaller below.

### `GymEntry`
```ts
interface GymEntry { id: string; kg?: number; sign?: "+" | "-"; delta?: number }
```
`id` is client-generated via `crypto.randomUUID()` at append time (enables fire-and-forget optimistic updates). At least one of kg / (sign+delta) must be set. Append via `appendGymEntry`, delete via `deleteGymEntry(entryId)` — per-entry ops, no bulk replace.

### `Schedule`
```ts
type Schedule = Record<DayName, { throwType: ThrowType; gym: boolean }>
```

## Storage / Save Pattern
All save functions in `storage.ts` are **async + throw on error**. App handlers apply changes optimistically, then revert state on rejection:
```ts
const prev = state[key];
setState((p) => ({ ...p, [key]: next }));
saveX(...).catch(() => setState((p) => ({ ...p, [key]: prev })));
```
Errors surface via `reportError()` → Mantine notification (red, auto-closes in 5s).

## Auth
- Supabase auth with Email+Password primary, OTP 6–10-digit email code as fallback (for devices/contexts where magic links don't deep-link back, e.g. iOS installed PWA)
- Signup writes `user_metadata.name`; Onboarding wizard reads this to skip the name step for existing users
- `App.tsx` subscribes to `supabase.auth.onAuthStateChange` and also calls `getSession()` on mount to resolve cached session immediately
- 8s timeout around `loadAllUserData`, 10s fallback to drop to login if nothing resolves — prevents the PWA from hanging on cold starts

## Gym Tab Design
- **Day cards (Paper)**: one Mantine `Paper withBorder` per gym day (filtered from the user's schedule). Chevron rotates on open.
- **Exercise rows (inner Paper, bg="dark.6")**: movement + sets + latest weight chip. Tap to open ProgressModal.
- **Row icons**: reorder (`IconArrowUp/Down`), edit (`IconPencil`), all `ActionIcon` (no native buttons).
- **Edit mode**: TextInputs for movement + sets, with a Delete button (red, `IconTrash`) on the left and Cancel/Save on the right. Suggestion dropdown autofills sets when movement matches a known exercise.
- **Shared progress across days**: typing a movement that matches an existing exercise **reuses its catalog id** via `suggestions.find(...)` in GymTab's commit function → the same exercise rendered on multiple days shares `gym_entries` history.
- **ProgressModal (Mantine Modal)**: latest entry (with × delete) in the header, older entries as chips each with × delete, kg NumberInput (step 0.25, decimalScale 2) + rep delta NumberInput on the same row (both full-width via `Group grow`), Append button.
- **Delete semantics**: "Delete" on a row only removes the `plan_days` row for that day; catalog entry + history + other days untouched.

## Week Tab Design
- Week nav: ActionIcon chevrons.
- Each `DayCard` is a Mantine `Paper` with today highlighting (`borderColor: var(--accent2)`).
- Inside: `MovementSection` + `ThrowingSection` + `GymSection` each rendered as its own inner `Paper withBorder bg="dark.6"` for visual consistency with Gym tab.
- `ThrowingSection`: SegmentedControl for throw type (Jav+LT / Mound), ActionIcon ✕ to remove throwing for the day, NumberInput for working throws / long-toss distance, Select for intensity.
- Movement / post-throw / javelin info modals live inside their respective sections and stay mounted (toggle via `opened` prop) so they animate properly. `MovementSection` uses a `displayedSection` state separate from `activeSection` so title/content don't flash empty during the close animation.

## Schedule Logic
User-configurable via the schedule editor (Settings modal + Onboarding step 2). `DEFAULT_SCHEDULE` in `constants.ts` seeds a new account with the original defaults (Tue/Thu/Sat jav+LT, Wed/Fri/Sun mound, Mon/Thu rest, Tue/Thu/Fri gym).

Deload: every 4th week (`weekNum % 4 === 0`).

## Environment
`.env` (gitignored) holds:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
Values are baked into the bundle at build time (Vite). The publishable key is safe to ship in client code — RLS enforces access.

## Dashboard setup (Supabase)
- **Auth → Sign In / Providers → Email**: "Allow new users to sign up" ON, "Confirm email" OFF
- **Auth → URL Configuration**: add `https://petteriharo.github.io/pitcher-tracker/` to Site URL + Redirect URLs
- **Auth → Emails → SMTP Settings**: custom SMTP (Resend) to bypass the default per-hour rate limit on built-in email
- **Auth → Email Templates → Magic Link**: customized to show the 6-digit `{{ .Token }}` prominently (needed for OTP flow on iOS PWA)

## Making a Release (deploy to GitHub Pages)
```bash
npm run deploy
```
Runs `predeploy` (`npm run build` → `tsc -b && vite build`), then pushes `dist/` to `gh-pages` via the `gh-pages` package.

**Live URL:** https://petteriharo.github.io/pitcher-tracker/

Vite base path `/pitcher-tracker/` in `vite.config.ts` matches the repo name.

## Dev
```bash
npm install
npm run dev        # localhost:5173
npm run build      # type-check + build to dist/
npm run preview    # preview the built dist/ locally
```

## Design Principles
- Dark mode only (Mantine `forceColorScheme="dark"` + CSS variables for bespoke UI)
- Mobile-first — designed for phone use during training; PWA-friendly
- Mantine primitives first; fall back to custom CSS only for app-specific layout
- Optimistic saves with automatic revert on failure; all errors surface via red Notifications
- Save functions throw on error (never fire-and-forget without catch); no silent data loss
- Amber (`--amber`) is the progression/weight accent throughout the gym UI
- Today's day card auto-opens
