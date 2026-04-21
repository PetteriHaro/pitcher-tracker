import type { Schedule } from "./types";

export const MOVEMENT_KEYS = [
  "spine",
  "shoulders",
  "hips",
  "balance",
  "core",
  "inversions",
] as const;

export type MovementKey = (typeof MOVEMENT_KEYS)[number];

export const MOVEMENT_LABELS: Record<MovementKey, string> = {
  spine: "Spine mobility",
  shoulders: "Shoulder mobility",
  hips: "Hips & ankles",
  balance: "Balance & body control",
  core: "Core & rotation",
  inversions: "Inversions",
};

export const DAY_NAMES = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

// Default schedule used when seeding a new user's schedule_days rows.
export const DEFAULT_SCHEDULE: Schedule = {
  Mon: { throwType: "rest",              gym: false },
  Tue: { throwType: "javelin_longtoss",  gym: true  },
  Wed: { throwType: "mound_bullpen",     gym: false },
  Thu: { throwType: "rest",              gym: true  },
  Fri: { throwType: "javelin_longtoss",  gym: true  },
  Sat: { throwType: "mound_bullpen",     gym: false },
  Sun: { throwType: "mound_bullpen",     gym: false },
};

export const INTENSITY_OPTIONS = [
  "60-70%",
  "70-80%",
  "80-90%",
  "90-100%",
] as const;
