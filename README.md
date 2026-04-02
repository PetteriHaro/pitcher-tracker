# Pitcher Tracker

A mobile-first progressive web app for tracking a pitcher's daily training — movement practice, throwing sessions, gym days, and long-term progress milestones.

**Live:** https://petteriharo.github.io/pitcher-tracker/

## Features

- **Week view** — navigate past and future weeks, each day shows what's scheduled
- **Movement practice** — 7-item checklist tracked every day
- **Throwing sessions** — separate fields for javelin/long toss days vs mound/bullpen days
- **Gym tracking** — Tue & Fri
- **Weekly summary** — total throws, movement completion rate, post-throw recovery rate
- **Deload weeks** — automatically flagged every 4th week
- **Progress milestones** — log every 2 weeks, bar charts for long toss distance and velocity
- **Dark mode, mobile-first**
- **Offline** — all data stored in localStorage

## Stack

React 18 · TypeScript · Vite · moment.js · localStorage · GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Builds and pushes to the `gh-pages` branch. Live in ~1 minute.
