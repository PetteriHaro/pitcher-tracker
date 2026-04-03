import type { DayData, Day, Throwing, ThrowType } from "../types";
import type { MovementKey } from "../constants";
import {
  toISO,
  addDays,
  getMondayOfWeek,
  weekNumberFor,
  isDeloadWeek,
  formatDate,
  parseISO,
  today,
} from "../utils/dates";
import { initDay } from "../utils/initDay";
import WeeklySummary from "./WeeklySummary";
import DayCard from "./DayCard";

interface Props {
  weekOffset: number;
  startDate: string;
  data: DayData;
  onDataChange: (iso: string, day: Day) => void;
  onWeekChange: (delta: number) => void;
}

export default function WeekTab({
  weekOffset,
  startDate,
  data,
  onDataChange,
  onWeekChange,
}: Props) {
  const weekStart = addDays(
    getMondayOfWeek(parseISO(startDate).toDate()),
    weekOffset * 7,
  );
  const weekEnd = addDays(weekStart, 6);
  const weekNum = weekNumberFor(toISO(weekStart), startDate);
  const deload = isDeloadWeek(weekNum);
  const todayISO = toISO(today().toDate());

  const days = Array.from({ length: 7 }, (_, i) => {
    const iso = toISO(addDays(weekStart, i).toDate());
    return data[iso] ?? initDay(iso);
  });

  function getDay(iso: string): Day {
    return data[iso] ?? initDay(iso);
  }

  function handleMovement(iso: string, key: MovementKey, val: boolean) {
    const day = {
      ...getDay(iso),
      movement: { ...getDay(iso).movement, [key]: val },
    };
    onDataChange(iso, day);
  }

  function handleThrow(
    iso: string,
    key: keyof Throwing,
    val: Throwing[keyof Throwing],
  ) {
    const day = getDay(iso);
    if (!day.throwing) return;
    onDataChange(iso, { ...day, throwing: { ...day.throwing, [key]: val } });
  }

  function handleThrowToggle(iso: string, type: ThrowType | null) {
    const day = getDay(iso);
    if (type === null) {
      onDataChange(iso, { ...day, throwing: null });
    } else {
      const existing = day.throwing;
      onDataChange(iso, {
        ...day,
        throwing: existing
          ? { ...existing, type }
          : {
              type,
              javelinDone: false,
              workingThrows: "",
              longTossMaxDistance: "",
              intensity: "70-80%",
              postThrowRecovery: false,
            },
      });
    }
  }

  function handleGymToggle(iso: string, val: boolean) {
    const day = getDay(iso);
    onDataChange(iso, { ...day, gym: val });
  }

  return (
    <div className="tab-panel">
      <div className="week-nav">
        <button className="nav-btn" onClick={() => onWeekChange(-1)}>
          ‹
        </button>
        <div className="week-label">
          <strong>
            Week {weekNum}
            {deload ? " · Deload" : ""}
          </strong>
          <span>
            {formatDate(weekStart)} – {formatDate(weekEnd)}
          </span>
        </div>
        <button className="nav-btn" onClick={() => onWeekChange(1)}>
          ›
        </button>
      </div>

      <WeeklySummary days={days} />

      {days.map((day, i) => {
        const iso = toISO(addDays(weekStart, i).toDate());
        return (
          <DayCard
            key={iso}
            day={day}
            isToday={iso === todayISO}
            onMovementChange={(key, val) => handleMovement(iso, key, val)}
            onThrowChange={(key, val) => handleThrow(iso, key, val)}
            onThrowToggle={(type) => handleThrowToggle(iso, type)}
            onGymToggle={(val) => handleGymToggle(iso, val)}
          />
        );
      })}
    </div>
  );
}
