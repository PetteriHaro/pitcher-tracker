import { supabase } from "./supabase";
import type { Day, DayData, GymEntry, GymExercise, GymPlan, GymProgress } from "../types";

export interface LocalSnapshot {
  startDate: string | null;
  data: DayData;
  gymPlan: GymPlan;
  gymProgress: GymProgress;
}

// ---------------------------------------------------------------------------
// Row ↔ type converters
// ---------------------------------------------------------------------------

function dayToRow(userId: string, iso: string, day: Day) {
  return {
    user_id: userId,
    date: iso,
    day_of_week: day.dayOfWeek,
    spine: day.movement.spine,
    shoulders: day.movement.shoulders,
    hips: day.movement.hips,
    balance: day.movement.balance,
    core: day.movement.core,
    inversions: day.movement.inversions,
    throw_type: day.throwing?.type ?? null,
    javelin_done: day.throwing?.javelinDone ?? null,
    working_throws:
      day.throwing?.workingThrows === "" ? null : (day.throwing?.workingThrows ?? null),
    long_toss_max_distance:
      day.throwing?.longTossMaxDistance === ""
        ? null
        : (day.throwing?.longTossMaxDistance ?? null),
    intensity: day.throwing?.intensity ?? null,
    post_throw_recovery: day.throwing?.postThrowRecovery ?? null,
    gym_done: day.gym,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDay(row: Record<string, any>): Day {
  return {
    date: row.date,
    dayOfWeek: row.day_of_week,
    movement: {
      spine: row.spine,
      shoulders: row.shoulders,
      hips: row.hips,
      balance: row.balance,
      core: row.core,
      inversions: row.inversions,
    },
    throwing: row.throw_type
      ? {
          type: row.throw_type,
          javelinDone: row.javelin_done ?? undefined,
          workingThrows: row.working_throws ?? "",
          longTossMaxDistance: row.long_toss_max_distance ?? "",
          intensity: row.intensity ?? undefined,
          postThrowRecovery: row.post_throw_recovery ?? false,
        }
      : null,
    gym: row.gym_done,
  };
}

// ---------------------------------------------------------------------------
// Load all user data on startup
// ---------------------------------------------------------------------------

export async function loadAllUserData(userId: string): Promise<LocalSnapshot> {
  const [profileRes, daysRes, exercisesRes, entriesRes] = await Promise.all([
    supabase.from("user_profiles").select("start_date").eq("user_id", userId).single(),
    supabase.from("training_days").select("*").eq("user_id", userId),
    supabase.from("gym_exercises").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("gym_entries").select("*").eq("user_id", userId).order("position"),
  ]);

  const startDate: string | null = profileRes.data?.start_date ?? null;

  const data: DayData = {};
  for (const row of daysRes.data ?? []) {
    data[row.date] = rowToDay(row);
  }

  const gymPlan: GymPlan = {};
  for (const row of exercisesRes.data ?? []) {
    if (!gymPlan[row.day_name]) gymPlan[row.day_name] = [];
    gymPlan[row.day_name].push({ id: row.exercise_id, name: row.name });
  }

  const gymProgress: GymProgress = {};
  for (const row of entriesRes.data ?? []) {
    if (!gymProgress[row.exercise_id]) gymProgress[row.exercise_id] = [];
    gymProgress[row.exercise_id].push({
      kg: row.kg ?? undefined,
      sign: row.sign ?? undefined,
      delta: row.delta ?? undefined,
    });
  }

  return { startDate, data, gymPlan, gymProgress };
}

// ---------------------------------------------------------------------------
// Individual fire-and-forget saves
// ---------------------------------------------------------------------------

export function saveStartDate(userId: string, date: string | null): void {
  supabase
    .from("user_profiles")
    .upsert({ user_id: userId, start_date: date }, { onConflict: "user_id" })
    .then(({ error }) => { if (error) console.error("saveStartDate", error); });
}

export function saveDay(userId: string, iso: string, day: Day): void {
  supabase
    .from("training_days")
    .upsert(dayToRow(userId, iso, day), { onConflict: "user_id,date" })
    .then(({ error }) => { if (error) console.error("saveDay", error); });
}

export function saveGymPlanDay(
  userId: string,
  dayName: string,
  exercises: GymExercise[],
): void {
  (async () => {
    await supabase
      .from("gym_exercises")
      .delete()
      .eq("user_id", userId)
      .eq("day_name", dayName);
    if (exercises.length > 0) {
      await supabase.from("gym_exercises").insert(
        exercises.map((ex, i) => ({
          user_id: userId,
          exercise_id: ex.id,
          day_name: dayName,
          name: ex.name,
          sort_order: i,
        })),
      );
    }
  })().catch((e) => console.error("saveGymPlanDay", e));
}

export function saveGymProgressExercise(
  userId: string,
  exerciseId: string,
  history: GymEntry[],
): void {
  (async () => {
    await supabase
      .from("gym_entries")
      .delete()
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId);
    if (history.length > 0) {
      await supabase.from("gym_entries").insert(
        history.map((entry, i) => ({
          user_id: userId,
          exercise_id: exerciseId,
          kg: entry.kg ?? null,
          sign: entry.sign ?? null,
          delta: entry.delta ?? null,
          position: i,
        })),
      );
    }
  })().catch((e) => console.error("saveGymProgressExercise", e));
}

// ---------------------------------------------------------------------------
// Bulk save — used during migration and JSON import
// ---------------------------------------------------------------------------

export async function saveAllUserData(
  userId: string,
  snapshot: LocalSnapshot,
): Promise<void> {
  await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, start_date: snapshot.startDate }, { onConflict: "user_id" });

  if (Object.keys(snapshot.data).length > 0) {
    await supabase.from("training_days").upsert(
      Object.entries(snapshot.data).map(([iso, day]) => dayToRow(userId, iso, day)),
      { onConflict: "user_id,date" },
    );
  }

  for (const [dayName, exercises] of Object.entries(snapshot.gymPlan)) {
    await supabase
      .from("gym_exercises")
      .delete()
      .eq("user_id", userId)
      .eq("day_name", dayName);
    if (exercises.length > 0) {
      await supabase.from("gym_exercises").insert(
        exercises.map((ex, i) => ({
          user_id: userId,
          exercise_id: ex.id,
          day_name: dayName,
          name: ex.name,
          sort_order: i,
        })),
      );
    }
  }

  for (const [exerciseId, history] of Object.entries(snapshot.gymProgress)) {
    await supabase
      .from("gym_entries")
      .delete()
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId);
    if (history.length > 0) {
      await supabase.from("gym_entries").insert(
        history.map((entry, i) => ({
          user_id: userId,
          exercise_id: exerciseId,
          kg: entry.kg ?? null,
          sign: entry.sign ?? null,
          delta: entry.delta ?? null,
          position: i,
        })),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Reset — deletes all rows for the user across all tables
// ---------------------------------------------------------------------------

export async function clearAllUserData(userId: string): Promise<void> {
  await Promise.all([
    supabase.from("user_profiles").delete().eq("user_id", userId),
    supabase.from("training_days").delete().eq("user_id", userId),
    supabase.from("gym_exercises").delete().eq("user_id", userId),
    supabase.from("gym_entries").delete().eq("user_id", userId),
  ]);
}

