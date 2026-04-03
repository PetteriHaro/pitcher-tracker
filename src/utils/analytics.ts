import type { DayData } from "../types";
import { MOVEMENT_KEYS } from "../constants";
import {
  parseISO,
  addDays,
  getMondayOfWeek,
  toISO,
  weekNumberFor,
} from "./dates";

export interface LTSession {
  date: string;
  weekNumber: number;
  throws: number;
  maxDist: number;
}

export interface MoundSession {
  date: string;
  weekNumber: number;
  throws: number;
  intensity: string;
}

export interface WeekStat {
  weekNumber: number;
  weekStartISO: string;
  totalThrows: number;
  movementDays: number;
  throwDays: number;
  recoveryDone: number;
  ltSessions: LTSession[];
  moundSessions: MoundSession[];
}

export interface AllTimeStats {
  totalThrows: number;
  weeksActive: number;
  bestLTDistance: number;
  movementRate: number; // 0-1
  recoveryRate: number; // 0-1
  totalSessions: number;
}

function weeksInRange(startDateISO: string, data: DayData): number {
  const dates = Object.keys(data);
  if (dates.length === 0) return 1;
  const start = parseISO(startDateISO);
  const maxDate = dates.reduce((a, b) => (a > b ? a : b));
  const endMon = getMondayOfWeek(parseISO(maxDate).toDate());
  const weeks = Math.round(parseISO(toISO(endMon)).diff(start, "days") / 7) + 1;
  return Math.max(1, weeks);
}

export function computeWeeklyStats(
  data: DayData,
  startDateISO: string,
): WeekStat[] {
  const numWeeks = weeksInRange(startDateISO, data);
  const stats: WeekStat[] = [];

  for (let w = 0; w < numWeeks; w++) {
    const weekStart = addDays(parseISO(startDateISO), w * 7);
    const weekStartISO = toISO(weekStart.toDate());
    const weekNum = w + 1;
    const stat: WeekStat = {
      weekNumber: weekNum,
      weekStartISO,
      totalThrows: 0,
      movementDays: 0,
      throwDays: 0,
      recoveryDone: 0,
      ltSessions: [],
      moundSessions: [],
    };

    for (let d = 0; d < 7; d++) {
      const iso = toISO(addDays(weekStart, d).toDate());
      const day = data[iso];
      if (!day) continue;

      if (MOVEMENT_KEYS.every((k) => day.movement[k])) stat.movementDays++;

      if (day.throwing) {
        const throws = Number(day.throwing.workingThrows) || 0;
        stat.totalThrows += throws;
        stat.throwDays++;
        if (day.throwing.postThrowRecovery) stat.recoveryDone++;

        if (day.throwing.type === "javelin_longtoss") {
          stat.ltSessions.push({
            date: iso,
            weekNumber: weekNum,
            throws,
            maxDist: Number(day.throwing.longTossMaxDistance) || 0,
          });
        } else if (day.throwing.type === "mound_bullpen") {
          stat.moundSessions.push({
            date: iso,
            weekNumber: weekNum,
            throws,
            intensity: day.throwing.intensity ?? "70-80%",
          });
        }
      }
    }

    // Only include weeks that have any data
    const hasData = Object.keys(data).some((iso) => {
      const wk = weekNumberFor(iso, startDateISO);
      return wk === weekNum;
    });
    if (hasData) stats.push(stat);
  }

  return stats;
}

export function computeAllTimeStats(
  weeklyStats: WeekStat[],
  data: DayData,
): AllTimeStats {
  let totalThrows = 0;
  let totalMoveDays = 0;
  let totalThrowDays = 0;
  let totalRecovery = 0;
  let bestLT = 0;

  for (const wk of weeklyStats) {
    totalThrows += wk.totalThrows;
    totalMoveDays += wk.movementDays;
    totalThrowDays += wk.throwDays;
    totalRecovery += wk.recoveryDone;
    for (const s of wk.ltSessions) {
      if (s.maxDist > bestLT) bestLT = s.maxDist;
    }
  }

  const totalDaysLogged = Object.keys(data).length;

  return {
    totalThrows,
    weeksActive: weeklyStats.length,
    bestLTDistance: bestLT,
    movementRate: totalDaysLogged > 0 ? totalMoveDays / totalDaysLogged : 0,
    recoveryRate: totalThrowDays > 0 ? totalRecovery / totalThrowDays : 0,
    totalSessions: totalThrowDays,
  };
}

export function allLTSessions(weeklyStats: WeekStat[]): LTSession[] {
  return weeklyStats.flatMap((w) => w.ltSessions).filter((s) => s.maxDist > 0);
}
