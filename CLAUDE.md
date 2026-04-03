# Pitcher Tracker — Claude Context

> **Maintenance note for Claude:** Keep this file up to date as the codebase evolves. After adding new files, data model changes, localStorage keys, or significant design decisions, update the relevant section here before committing.

## Stack
- **React 18 + TypeScript** via Vite
- **moment.js** for all date handling (no native Date manipulation)
- **localStorage** for all persistence (no backend, no auth)
- Single global CSS file (`src/style.css`) — no CSS modules, no Tailwind
- No routing library — tab state is in App.tsx

## Project Structure
```
src/
  App.tsx              # Root — all persistent state lives here
  main.tsx             # ReactDOM entry
  style.css            # All styles
  types.ts             # TypeScript interfaces (Day, Throwing, GymPlan, GymProgress, GymEntry, etc.)
  constants.ts         # MOVEMENT_KEYS, THROW_TYPE map, GYM_DAYS, INTENSITY_OPTIONS
  throwingExercises.ts # JAVELIN_PROGRAM and POST_THROW_RECOVERY exercise definitions
  gymExercises.ts      # GYM_EXERCISE_TEMPLATES — default exercise names per gym day
  utils/
    dates.ts           # All date helpers (uses moment.js)
    storage.ts         # localStorage read/write helpers
    initDay.ts         # Factory to create a blank Day for a given ISO date
    analytics.ts       # computeWeeklyStats, computeAllTimeStats, allLTSessions
  components/
    Onboarding.tsx     # First-run start date picker
    WeekTab.tsx        # Week navigation + day list
    WeeklySummary.tsx  # 3-stat summary card (throws, movement rate, recovery rate)
    DayCard.tsx        # Collapsible day card with pills and progress dots
    MovementSection.tsx
    ThrowingSection.tsx
    GymSection.tsx     # Gym done checkbox + "Open Gym →" link that switches to Gym tab
    GymTab.tsx         # Gym schedule (day cards) + per-exercise progress modal
    Toggle.tsx         # Reusable toggle switch component
    AnalyticsTab.tsx   # Charts for throws, long toss, movement, recovery, intensity
    SettingsModal.tsx  # Modal to change program start date, import/reset data
```

## Data Model
All data is stored in `localStorage` under these keys:
- `startDate` — ISO string of program Monday start
- `data` — `Record<ISO, Day>` — one entry per day that has been touched
- `gymPlan` — `Record<dayName, string[]>` — exercise names per gym day (Tue/Thu/Fri/Sat), persistent (not per-week)
- `gymProgress` — `Record<exerciseName, GymEntry[]>` — structured progression history per exercise, shared across all days that include that exercise

Days are lazily initialized via `initDay(iso)` when first accessed.

### GymEntry shape
```ts
interface GymEntry {
  kg?: number;        // weight in kg
  sign?: "+" | "-";  // direction of rep delta
  delta?: number;     // rep change amount
}
```
One of `kg`, `delta`, or both must be set. Formatted as e.g. `"45kg +2"`, `"+1"`, `"22.5kg"`.

## Gym Tab Design
- **Schedule section**: 4 collapsible day cards (Tue/Thu/Fri/Sat). Each row shows exercise name + latest logged weight. Tap a row to open the progress modal.
- **Progress modal**: Shows current value large in amber, history as chips (excluding latest), kg number input + rep stepper (−/+), pre-filled from last entry. Appends a new `GymEntry` to the history on save.
- **Shared progress**: Exercise names are the key — "Chest fly 4x8" on Tue and Fri share the same progress history. Names must match exactly.
- **"Open Gym →"** button in the day card GymSection navigates directly to the Gym tab via `onOpenGymTab` callback threaded from App → WeekTab → DayCard → GymSection.

## Schedule Logic
Determined by day-of-week only (see `constants.ts → THROW_TYPE`):
- Mon: rest (no throwing)
- Tue, Thu, Sat: javelin + long toss
- Wed, Fri, Sun: mound / bullpen
- Tue, Fri: gym day (`GYM_DAYS`)

Deload: every 4th week (`weekNum % 4 === 0`).

## Program Start Date
- Default/seeded: **2026-03-31** (Monday, week of March 31)
- Pre-populated: Apr 1 (Tue) and Apr 2 (Wed) Week 1 data
- Baseline milestone: 47m long toss, 65 mph velocity

## Making a Release (deploy to GitHub Pages)

```bash
npm run deploy
```

This runs `predeploy` (which runs `npm run build` → `tsc -b && vite build`), then pushes the `dist/` folder to the `gh-pages` branch via the `gh-pages` package.

**Live URL:** https://petteriharo.github.io/pitcher-tracker/

The Vite base path is `/pitcher-tracker/` (set in `vite.config.ts`), which matches the GitHub Pages repo path.

Steps when making a release:
1. Make sure all changes are committed on `main` (or your working branch)
2. Run `npm run deploy`
3. GitHub Pages auto-serves the updated `gh-pages` branch within ~1 minute

## Dev
```bash
npm install
npm run dev        # localhost:5173
npm run build      # type-check + build to dist/
npm run preview    # preview the built dist/ locally
```

## Design Principles
- Dark mode only (CSS variables in `:root`)
- Mobile-first — designed for phone use during training
- Modals only for progress logging (gym) — day entry fields are inline in collapsible cards
- Quick entry is the priority: checkboxes, number inputs, steppers — minimal friction
- Today's day card auto-opens
- Amber (`--amber`) is used for weights/progression values throughout the gym UI
