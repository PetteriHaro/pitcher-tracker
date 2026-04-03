import type { Day } from "../types";
import { DAY_NAMES, THROW_TYPE, GYM_DAYS } from "../constants";
import { parseISO } from "./dates";

export function initDay(dateISO: string): Day {
  const m = parseISO(dateISO);
  // isoWeekday: 1=Mon ... 7=Sun → index 0-6
  const dowIdx = m.isoWeekday() - 1;
  const dayName = DAY_NAMES[dowIdx]!;
  const throwType = THROW_TYPE[dayName]!;

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
            notes: "",
          },
    gym: GYM_DAYS.includes(dayName) ? { done: false, notes: "" } : null,
  };
}
