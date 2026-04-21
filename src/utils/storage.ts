import { supabase } from "./supabase";
import { reportError } from "./errorBus";
import type {
  Day,
  DayData,
  GymEntry,
  GymExercise,
  GymPlan,
  GymProgress,
  Schedule,
  ThrowType,
} from "../types";
import { DAY_NAMES, DEFAULT_SCHEDULE } from "../constants";

export interface LocalSnapshot {
  startDate: string | null;
  schedule: Schedule;
  data: DayData;
  gymPlan: GymPlan;
  gymProgress: GymProgress;
}

// ---------------------------------------------------------------------------
// Day-of-week helpers
// ---------------------------------------------------------------------------

function dayNameFromIndex(idx: number): string {
  return DAY_NAMES[idx]!;
}

function indexFromDayName(name: string): number {
  const i = DAY_NAMES.indexOf(name as (typeof DAY_NAMES)[number]);
  if (i < 0) throw new Error(`Unknown day name: ${name}`);
  return i;
}

// ---------------------------------------------------------------------------
// Row ↔ type converters
// ---------------------------------------------------------------------------

function dayToRow(userId: string, iso: string, day: Day) {
  return {
    user_id: userId,
    date: iso,
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
  // The `date` column now returns a JS Date string formatted as YYYY-MM-DD
  const iso: string = row.date;
  const dowIdx = new Date(iso + "T00:00:00").getDay(); // 0=Sun..6=Sat
  const mondayIdx = (dowIdx + 6) % 7; // 0=Mon..6=Sun
  return {
    date: iso,
    dayOfWeek: dayNameFromIndex(mondayIdx),
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
          type: row.throw_type as ThrowType,
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

function entryToRow(userId: string, exerciseId: string, entry: GymEntry) {
  let repDelta: number | null = null;
  if (entry.delta !== undefined && entry.sign) {
    repDelta = entry.sign === "-" ? -entry.delta : entry.delta;
  }
  return {
    id: entry.id,
    user_id: userId,
    exercise_id: exerciseId,
    kg: entry.kg ?? null,
    rep_delta: repDelta,
  };
}

function rowToEntry(row: {
  id: string;
  kg: number | null;
  rep_delta: number | null;
}): GymEntry {
  const entry: GymEntry = { id: row.id };
  if (row.kg != null) entry.kg = row.kg;
  if (row.rep_delta != null && row.rep_delta !== 0) {
    entry.sign = row.rep_delta > 0 ? "+" : "-";
    entry.delta = Math.abs(row.rep_delta);
  }
  return entry;
}

// ---------------------------------------------------------------------------
// Startup load
// ---------------------------------------------------------------------------

export async function loadAllUserData(userId: string): Promise<LocalSnapshot> {
  const [profileRes, scheduleRes, daysRes, exercisesRes, entriesRes] =
    await Promise.all([
      supabase.from("profiles").select("start_date").eq("user_id", userId).maybeSingle(),
      supabase.from("schedule_days").select("*").eq("user_id", userId),
      supabase.from("training_days").select("*").eq("user_id", userId),
      supabase
        .from("gym_exercises")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order"),
      supabase
        .from("gym_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]);

  const startDate: string | null = profileRes.data?.start_date ?? null;

  let schedule: Schedule;
  if ((scheduleRes.data ?? []).length === 7) {
    schedule = {};
    for (const row of scheduleRes.data!) {
      schedule[dayNameFromIndex(row.day_of_week)] = {
        throwType: row.throw_type as ThrowType,
        gym: row.gym,
      };
    }
  } else {
    schedule = { ...DEFAULT_SCHEDULE };
    // Seed the schedule if missing
    await seedDefaultSchedule(userId);
  }

  const data: DayData = {};
  for (const row of daysRes.data ?? []) {
    data[row.date] = rowToDay(row);
  }

  const gymPlan: GymPlan = {};
  for (const row of exercisesRes.data ?? []) {
    const dayName = dayNameFromIndex(row.day_of_week);
    if (!gymPlan[dayName]) gymPlan[dayName] = [];
    gymPlan[dayName].push({
      id: row.id,
      movement: row.movement,
      sets: row.sets ?? undefined,
    });
  }

  const gymProgress: GymProgress = {};
  for (const row of entriesRes.data ?? []) {
    if (!gymProgress[row.exercise_id]) gymProgress[row.exercise_id] = [];
    gymProgress[row.exercise_id].push(rowToEntry(row));
  }

  return { startDate, schedule, data, gymPlan, gymProgress };
}

async function seedDefaultSchedule(userId: string): Promise<void> {
  const rows = DAY_NAMES.map((name, idx) => ({
    user_id: userId,
    day_of_week: idx,
    throw_type: DEFAULT_SCHEDULE[name].throwType,
    gym: DEFAULT_SCHEDULE[name].gym,
  }));
  await supabase.from("schedule_days").upsert(rows, { onConflict: "user_id,day_of_week" });
}

// ---------------------------------------------------------------------------
// Fire-and-forget saves
// ---------------------------------------------------------------------------

export async function saveStartDate(userId: string, date: string | null): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, start_date: date }, { onConflict: "user_id" });
  if (error) { reportError("Couldn't save start date", error); throw error; }
}

export async function saveScheduleDay(
  userId: string,
  dayName: string,
  cfg: { throwType: ThrowType; gym: boolean },
): Promise<void> {
  const { error } = await supabase
    .from("schedule_days")
    .upsert(
      {
        user_id: userId,
        day_of_week: indexFromDayName(dayName),
        throw_type: cfg.throwType,
        gym: cfg.gym,
      },
      { onConflict: "user_id,day_of_week" },
    );
  if (error) { reportError("Couldn't save schedule", error); throw error; }
}

export async function saveDay(userId: string, iso: string, day: Day): Promise<void> {
  const { error } = await supabase
    .from("training_days")
    .upsert(dayToRow(userId, iso, day), { onConflict: "user_id,date" });
  if (error) { reportError("Couldn't save day", error); throw error; }
}

export async function saveGymPlanDay(
  userId: string,
  dayName: string,
  exercises: GymExercise[],
): Promise<void> {
  const dow = indexFromDayName(dayName);
  if (exercises.length > 0) {
    const { error: upErr } = await supabase.from("gym_exercises").upsert(
      exercises.map((ex, i) => ({
        id: ex.id,
        user_id: userId,
        day_of_week: dow,
        movement: ex.movement,
        sets: ex.sets ?? null,
        sort_order: i,
      })),
      { onConflict: "id" },
    );
    if (upErr) { reportError("Couldn't save gym plan", upErr); throw upErr; }
  }
  // Remove exercises for this day that are no longer in the list
  const keepIds = exercises.map((ex) => ex.id);
  const delQuery =
    keepIds.length > 0
      ? supabase
          .from("gym_exercises")
          .delete()
          .eq("user_id", userId)
          .eq("day_of_week", dow)
          .not("id", "in", `(${keepIds.map((id) => `"${id}"`).join(",")})`)
      : supabase
          .from("gym_exercises")
          .delete()
          .eq("user_id", userId)
          .eq("day_of_week", dow);
  const { error: delErr } = await delQuery;
  if (delErr) { reportError("Couldn't save gym plan", delErr); throw delErr; }
}

export async function appendGymEntry(
  userId: string,
  exerciseId: string,
  entry: GymEntry,
): Promise<void> {
  const { error } = await supabase
    .from("gym_entries")
    .insert(entryToRow(userId, exerciseId, entry));
  if (error) { reportError("Couldn't save gym entry", error); throw error; }
}

export async function deleteGymEntry(userId: string, entryId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", entryId);
  if (error) { reportError("Couldn't delete gym entry", error); throw error; }
}

