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
