export type ThrowType = "javelin_longtoss" | "mound_bullpen" | "rest";
export type Intensity = "60-70%" | "70-80%" | "80-90%" | "90-100%";

export interface Movement {
  spine: boolean;
  shoulders: boolean;
  hips: boolean;
  balance: boolean;
  core: boolean;
  inversions: boolean;
}

export interface Throwing {
  type: ThrowType;
  javelinDone?: boolean;
  workingThrows: number | "";
  longTossMaxDistance?: number | "";
  intensity?: Intensity;
  postThrowRecovery: boolean;
}

export interface Day {
  date: string;
  dayOfWeek: string;
  movement: Movement;
  throwing: Throwing | null;
  gym: boolean;
}

export type DayData = Record<string, Day>;

// An exercise with a stable ID and a mutable display name
export interface GymExercise {
  id: string;
  name: string;
}

// Which exercises are scheduled per day (Tue/Thu/Fri/Sat)
export type GymPlan = Record<string, GymExercise[]>;

// A single logged entry: kg only, delta only, or both
export interface GymEntry {
  kg?: number;
  sign?: "+" | "-";
  delta?: number;
}

// Progress history per exercise ID — shared across all days
export type GymProgress = Record<string, GymEntry[]>;
