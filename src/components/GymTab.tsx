import { useState } from "react";
import type { GymPlan, GymProgress, GymEntry } from "../types";
import { GYM_EXERCISE_TEMPLATES } from "../gymExercises";

const GYM_DAYS = ["Tue", "Thu", "Fri", "Sat"] as const;

function formatEntry(e: GymEntry): string {
  const parts: string[] = [];
  if (e.kg !== undefined) parts.push(`${e.kg}kg`);
  if (e.delta !== undefined && e.sign !== undefined) parts.push(`${e.sign}${e.delta}`);
  return parts.join(" ");
}

function ProgressModal({
  name,
  history,
  onAppend,
  onClose,
}: {
  name: string;
  history: GymEntry[];
  onAppend: (entry: GymEntry) => void;
  onClose: () => void;
}) {
  const last = history.length > 0 ? history[history.length - 1] : null;
  const [kg, setKg] = useState(last?.kg !== undefined ? String(last.kg) : "");
  // deltaVal is a signed number; null means not set
  const [deltaVal, setDeltaVal] = useState<number | null>(
    last?.delta !== undefined
      ? (last.sign === "-" ? -last.delta : last.delta)
      : null
  );

  function buildEntry(): GymEntry | null {
    const kgNum = kg.trim() !== "" ? parseFloat(kg) : undefined;
    if (kgNum === undefined && deltaVal === null) return null;
    const entry: GymEntry = {};
    if (kgNum !== undefined) entry.kg = kgNum;
    if (deltaVal !== null) {
      entry.sign = deltaVal >= 0 ? "+" : "-";
      entry.delta = Math.abs(deltaVal);
    }
    return entry;
  }

  const entry = buildEntry();
  const preview = entry ? formatEntry(entry) : "";
  const current = history.length > 0 ? formatEntry(history[history.length - 1]) : null;

  function stepDelta(amount: number) {
    setDeltaVal((v) => (v ?? 0) + amount);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{name}</div>
          {current && <div className="gym-modal-current">{current}</div>}
        </div>
        <div className="modal-body">
          {history.length > 1 && (
            <div className="gym-history-strip">
              {history.slice(0, -1).map((e, i) => (
                <span key={i} className="gym-history-chip">{formatEntry(e)}</span>
              ))}
            </div>
          )}
          <div className="gym-entry-row">
            <div className="gym-entry-field">
              <label className="gym-entry-label">Kg</label>
              <input
                type="number"
                className="gym-entry-input"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="—"
                min={0}
                step={0.5}
                autoFocus
              />
            </div>
            <div className="gym-entry-field">
              <label className="gym-entry-label">Reps +/−</label>
              <div className="gym-stepper">
                <button type="button" className="gym-step-btn" onClick={() => stepDelta(-1)}>−</button>
                <span className="gym-step-val">
                  {deltaVal === null ? "—" : deltaVal > 0 ? `+${deltaVal}` : `${deltaVal}`}
                </span>
                <button type="button" className="gym-step-btn" onClick={() => stepDelta(1)}>+</button>
              </div>
            </div>
          </div>
          {preview && (
            <div className="gym-entry-preview">Will append: <strong>{preview}</strong></div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => { if (entry) { onAppend(entry); onClose(); } }}
            disabled={!entry}
            style={{ opacity: entry ? 1 : 0.4 }}
          >
            Append
          </button>
        </div>
      </div>
    </div>
  );
}

function DayPlanCard({
  dayName,
  exercises,
  gymProgress,
  onExerciseTap,
  onPlanChange,
}: {
  dayName: string;
  exercises: string[];
  gymProgress: GymProgress;
  onExerciseTap: (name: string) => void;
  onPlanChange: (exercises: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`day-card${open ? " open" : ""}`}>
      <div className="day-header" onClick={() => setOpen((o) => !o)}>
        <div className="day-info">
          <span className="day-name">{dayName}</span>
          <span className="day-date">{exercises.length} exercises</span>
        </div>
        <div className="day-right">
          <span className="chevron">›</span>
        </div>
      </div>
      {open && (
        <div className="day-body">
          {exercises.map((name, i) => {
            const history = gymProgress[name] ?? [];
            const current = history.length > 0 ? formatEntry(history[history.length - 1]) : null;
            return (
              <div key={i} className="gym-plan-row" onClick={() => onExerciseTap(name)}>
                <span className="gym-progress-name">{name}</span>
                <span className="gym-progress-weights">{current ?? <span style={{ color: "var(--border)" }}>—</span>}</span>
                <button
                  type="button"
                  className="gym-delete-btn"
                  onClick={(e) => { e.stopPropagation(); onPlanChange(exercises.filter((_, idx) => idx !== i)); }}
                >×</button>
              </div>
            );
          })}
          <button type="button" className="gym-add-btn" onClick={() => onPlanChange([...exercises, ""])}>
            + Add exercise
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  gymPlan: GymPlan;
  gymProgress: GymProgress;
  onPlanChange: (dayName: string, exercises: string[]) => void;
  onProgressChange: (exerciseName: string, history: GymEntry[]) => void;
}

export default function GymTab({ gymPlan, gymProgress, onPlanChange, onProgressChange }: Props) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="tab-panel">
      {GYM_DAYS.map((dayName) => (
        <DayPlanCard
          key={dayName}
          dayName={dayName}
          exercises={gymPlan[dayName] ?? GYM_EXERCISE_TEMPLATES[dayName] ?? []}
          gymProgress={gymProgress}
          onExerciseTap={setEditing}
          onPlanChange={(exs) => onPlanChange(dayName, exs)}
        />
      ))}

      {editing !== null && (
        <ProgressModal
          name={editing}
          history={gymProgress[editing] ?? []}
          onAppend={(entry) => {
            const prev = gymProgress[editing] ?? [];
            onProgressChange(editing, [...prev, entry]);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
