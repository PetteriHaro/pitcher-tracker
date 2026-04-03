import { useState } from "react";
import type { Day, Throwing } from "../types";
import { MOVEMENT_KEYS, type MovementKey } from "../constants";
import { formatDate, parseISO } from "../utils/dates";
import MovementSection from "./MovementSection";
import ThrowingSection from "./ThrowingSection";
import GymSection from "./GymSection";

interface Props {
  day: Day;
  isToday: boolean;
  onMovementChange: (key: MovementKey, val: boolean) => void;
  onThrowChange: (key: keyof Throwing, val: Throwing[keyof Throwing]) => void;
  onGymToggle: (val: boolean) => void;
  onThrowToggle: (type: "javelin_longtoss" | "mound_bullpen" | null) => void;
  onOpenGymTab: () => void;
}

export default function DayCard({
  day,
  isToday,
  onMovementChange,
  onThrowChange,
  onThrowToggle,
  onGymToggle,
  onOpenGymTab,
}: Props) {
  const [open, setOpen] = useState(isToday);

  const throwType = day.throwing?.type;
  const throwPillLabel =
    throwType === "javelin_longtoss"
      ? "Jav+LT"
      : throwType === "mound_bullpen"
        ? "Mound"
        : null;

  const dateStr = formatDate(parseISO(day.date));

  return (
    <div className={`day-card${isToday ? " today" : ""}${open ? " open" : ""}`}>
      <div className="day-header" onClick={() => setOpen((o) => !o)}>
        <div className="day-info">
          <span className="day-name">{day.dayOfWeek}</span>
          <span className="day-date">{dateStr}</span>
          <div className="day-pills">
            <span className="pill pill-move">Move</span>
            {throwPillLabel ? (
              <span className="pill pill-throw">{throwPillLabel}</span>
            ) : (
              <span className="pill pill-rest">Rest</span>
            )}
            {day.gym && <span className="pill pill-gym">Gym</span>}
          </div>
        </div>
        <div className="day-right">
          <div className="progress-dots">
            {MOVEMENT_KEYS.map((k) => (
              <div key={k} className={`dot${day.movement[k] ? " done" : ""}`} />
            ))}
          </div>
          <span className="chevron">›</span>
        </div>
      </div>

      {open && (
        <div className="day-body">
          <MovementSection
            movement={day.movement}
            onChange={onMovementChange}
          />
          <ThrowingSection
            throwing={day.throwing}
            onChange={onThrowChange}
            onToggle={onThrowToggle}
          />
          <GymSection gym={day.gym} onToggle={onGymToggle} onOpenGymTab={onOpenGymTab} />
        </div>
      )}
    </div>
  );
}
