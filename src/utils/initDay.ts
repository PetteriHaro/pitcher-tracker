import type { Day, Schedule } from "../types";
import { DAY_NAMES } from "../constants";
import { parseISO } from "./dates";

export function initDay(dateISO: string, schedule: Schedule): Day {
  const m = parseISO(dateISO);
  const dowIdx = m.isoWeekday() - 1; // 0=Mon..6=Sun
  const dayName = DAY_NAMES[dowIdx]!;
  const scheduleDay = schedule[dayName];
  const throwType = scheduleDay?.throwType ?? "rest";
  const gymScheduled = scheduleDay?.gym ?? false;

  return {
    date: dateISO,
    dayOfWeek: dayName,
    movement: {
      spine: false,
      shoulders: false,
      hips: false,
      balance: false,
      core: false,
      inversions: false,
    },
    throwing:
      throwType === "rest"
        ? null
        : {
            type: throwType,
            javelinDone: false,
            workingThrows: "",
            longTossMaxDistance: "",
            intensity: "70-80%",
            postThrowRecovery: false,
          },
    gym: gymScheduled,
  };
}
