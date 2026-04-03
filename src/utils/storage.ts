import type { DayData, GymPlan, GymProgress } from "../types";

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
  return raw ? (JSON.parse(raw) as GymPlan) : {};
}

export function saveGymPlan(plan: GymPlan): void {
  localStorage.setItem("gymPlan", JSON.stringify(plan));
}

export function loadGymProgress(): GymProgress {
  const raw = localStorage.getItem("gymProgress");
  return raw ? (JSON.parse(raw) as GymProgress) : {};
}

export function saveGymProgress(progress: GymProgress): void {
  localStorage.setItem("gymProgress", JSON.stringify(progress));
}
