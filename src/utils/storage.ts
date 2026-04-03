import type { DayData } from "../types";

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
