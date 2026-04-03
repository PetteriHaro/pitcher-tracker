import type { ThrowType } from "./types";

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

export const THROW_TYPE: Record<string, ThrowType> = {
  Mon: "rest",
  Tue: "javelin_longtoss",
  Wed: "mound_bullpen",
  Thu: "rest",
  Fri: "javelin_longtoss",
  Sat: "mound_bullpen",
  Sun: "mound_bullpen",
};

export const GYM_DAYS = ["Tue", "Thu", "Fri"];

export const INTENSITY_OPTIONS = [
  "60-70%",
  "70-80%",
  "80-90%",
  "90-100%",
] as const;
