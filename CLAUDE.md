# Pitcher Tracker — Claude Context

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
  types.ts             # TypeScript interfaces (Day, Throwing, Gym, Milestone, etc.)
  constants.ts         # MOVEMENT_KEYS, THROW_TYPE map, GYM_DAYS, INTENSITY_OPTIONS
  utils/
    dates.ts           # All date helpers (uses moment.js)
    storage.ts         # localStorage read/write helpers
    initDay.ts         # Factory to create a blank Day for a given ISO date
  components/
    Onboarding.tsx     # First-run start date picker
    WeekTab.tsx        # Week navigation + day list
    WeeklySummary.tsx  # 3-stat summary card (throws, movement rate, recovery rate)
    DayCard.tsx        # Collapsible day card with pills and progress dots
    MovementSection.tsx
    ThrowingSection.tsx
    GymSection.tsx
    Toggle.tsx         # Reusable toggle switch component
    MilestonesTab.tsx  # Charts + milestone card list
    MilestoneChart.tsx # Bar chart for a single metric
    MilestoneModal.tsx # Modal form for logging a milestone
    SettingsModal.tsx  # Modal to change program start date
```

## Data Model
All data is stored in `localStorage` under two keys:
- `startDate` — ISO string of program Monday start
- `data` — `Record<ISO, Day>` — one entry per day that has been touched
- `milestones` — `Milestone[]` — newest first

Days are lazily initialized via `initDay(iso)` when first accessed.

## Schedule Logic
Determined by day-of-week only (see `constants.ts → THROW_TYPE`):
- Mon: rest (no throwing)
- Tue, Thu, Sat: javelin + long toss
- Wed, Fri, Sun: mound / bullpen
- Tue, Fri: gym day

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
- No modals for day entry — all fields are inline in collapsible day cards
- Quick entry is the priority: checkboxes and number inputs, minimal friction
- Today's day card auto-opens
