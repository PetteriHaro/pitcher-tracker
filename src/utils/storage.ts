import type { DayData, GymExercise, GymPlan, GymProgress } from "../types";

export function loadStartDate(): string | null {
  return localStorage.getItem("startDate");
}

export function saveStartDate(date: string): void {
  localStorage.setItem("startDate", date);
}

export function loadData(): DayData {
  const raw = localStorage.getItem("data");
  return raw ? (JSON.parse(raw) as DayData) : {};
}

export function saveData(data: DayData): void {
  localStorage.setItem("data", JSON.stringify(data));
}

export function loadGymPlan(): GymPlan {
  const raw = localStorage.getItem("gymPlan");
  if (!raw) return {};
  return JSON.parse(raw) as GymPlan;
}

export function saveGymPlan(plan: GymPlan): void {
  localStorage.setItem("gymPlan", JSON.stringify(plan));
}

export function loadGymProgress(): GymProgress {
  const raw = localStorage.getItem("gymProgress");
  if (!raw) return {};
  return JSON.parse(raw) as GymProgress;
}

export function saveGymProgress(progress: GymProgress): void {
  localStorage.setItem("gymProgress", JSON.stringify(progress));
}

/**
 * One-shot migration from name-keyed gym data to ID-keyed.
 *
 * Old format:
 *   gymPlan:     Record<day, string[]>          (exercise names)
 *   gymProgress: Record<name, GymEntry[]>       (keyed by name)
 *
 * New format:
 *   gymPlan:     Record<day, GymExercise[]>     ({ id, name })
 *   gymProgress: Record<id, GymEntry[]>         (keyed by stable ID)
 *
 * Exercises that share the same name across days get the SAME id,
 * preserving shared history (matching old behaviour).
 *
 * Safe to call on every startup — skips immediately if already done.
 */
export function runGymMigrationV1(): void {
  if (localStorage.getItem("gymMigrationV1")) return;

  const planRaw = localStorage.getItem("gymPlan");
  const progressRaw = localStorage.getItem("gymProgress");

  // Nothing to migrate
  if (!planRaw && !progressRaw) {
    localStorage.setItem("gymMigrationV1", "1");
    return;
  }

  // Check if plan is already in new format (first exercise is an object, not a string)
  if (planRaw) {
    const parsed = JSON.parse(planRaw) as Record<string, unknown[]>;
    const firstDay = Object.values(parsed)[0];
    if (firstDay && firstDay.length > 0 && typeof firstDay[0] === "object") {
      // Already migrated
      localStorage.setItem("gymMigrationV1", "1");
      return;
    }
  }

  // Build name → id map. Same name across days → same id.
  const nameToId: Record<string, string> = {};
  let counter = 0;
  function idForName(name: string): string {
    if (!nameToId[name]) {
      nameToId[name] = `ex-migrated-${counter++}-${name.slice(0, 20).replace(/\s+/g, "_")}`;
    }
    return nameToId[name];
  }

  // Migrate plan
  const newPlan: GymPlan = {};
  if (planRaw) {
    const oldPlan = JSON.parse(planRaw) as Record<string, string[]>;
    for (const [day, names] of Object.entries(oldPlan)) {
      newPlan[day] = names.map((name): GymExercise => ({ id: idForName(name), name }));
    }
    saveGymPlan(newPlan);
  }

  // Migrate progress: re-key by id
  if (progressRaw) {
    const oldProgress = JSON.parse(progressRaw) as Record<string, unknown>;
    const newProgress: GymProgress = {};
    for (const [key, history] of Object.entries(oldProgress)) {
      const newKey = nameToId[key] ?? key; // unknown keys pass through
      newProgress[newKey] = history as GymProgress[string];
    }
    saveGymProgress(newProgress);
  }

  localStorage.setItem("gymMigrationV1", "1");
}
