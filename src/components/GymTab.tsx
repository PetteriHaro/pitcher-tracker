import { useState } from "react";
import type { GymExercise, GymPlan, GymProgress, GymEntry } from "../types";

const GYM_DAYS = ["Tue", "Thu", "Fri", "Sat"] as const;

function generateId(): string {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

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
  suggestions,
  onExerciseTap,
  onPlanChange,
}: {
  dayName: string;
  exercises: GymExercise[];
  gymProgress: GymProgress;
  suggestions: string[];
  onExerciseTap: (exercise: GymExercise) => void;
  onPlanChange: (exercises: GymExercise[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingNameIdx, setEditingNameIdx] = useState<number | null>(null);
  const [editingNameVal, setEditingNameVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function startEditName(i: number) {
    setEditingNameIdx(i);
    setEditingNameVal(exercises[i].name);
  }

  function commitName(i: number) {
    const trimmed = editingNameVal.trim();
    if (trimmed === "") {
      onPlanChange(exercises.filter((_, idx) => idx !== i));
    } else {
      onPlanChange(exercises.map((ex, idx) => idx === i ? { ...ex, name: trimmed } : ex));
    }
    setEditingNameIdx(null);
  }

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
          {exercises.map((ex, i) => {
            const history = gymProgress[ex.id] ?? [];
            const current = history.length > 0 ? formatEntry(history[history.length - 1]) : null;
            const isEditing = editingNameIdx === i;
            return (
              <div key={ex.id} className="gym-plan-row" onClick={() => { if (!isEditing && ex.name) onExerciseTap(ex); }}>
                {isEditing ? (
                  <div className="gym-name-input-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="gym-name-input"
                      value={editingNameVal}
                      onChange={(e) => { setEditingNameVal(e.target.value); setShowSuggestions(true); }}
                      onBlur={() => { setTimeout(() => { commitName(i); setShowSuggestions(false); }, 150); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { commitName(i); setShowSuggestions(false); } if (e.key === "Escape") { setEditingNameIdx(null); setShowSuggestions(false); } }}
                      autoFocus
                    />
                    {showSuggestions && (() => {
                      const q = editingNameVal.trim().toLowerCase();
                      const matches = suggestions.filter((s) => s.toLowerCase().includes(q) && s !== editingNameVal);
                      return matches.length > 0 ? (
                        <div className="gym-suggestions">
                          {matches.map((s) => (
                            <div
                              key={s}
                              className="gym-suggestion-item"
                              onMouseDown={(e) => { e.preventDefault(); setEditingNameVal(s); setShowSuggestions(false); }}
                            >{s}</div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <>
                    <div className="gym-reorder-btns">
                      <button
                        type="button"
                        className="gym-reorder-btn"
                        disabled={i === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = [...exercises];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          onPlanChange(next);
                        }}
                      >▲</button>
                      <button
                        type="button"
                        className="gym-reorder-btn"
                        disabled={i === exercises.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = [...exercises];
                          [next[i], next[i + 1]] = [next[i + 1], next[i]];
                          onPlanChange(next);
                        }}
                      >▼</button>
                    </div>
                    <span className="gym-progress-name">{ex.name || <span style={{ color: "var(--border)" }}>Unnamed</span>}</span>
                    <span className="gym-progress-weights">{current ?? <span style={{ color: "var(--border)" }}>—</span>}</span>
                    <button
                      type="button"
                      className="gym-edit-name-btn"
                      onClick={(e) => { e.stopPropagation(); startEditName(i); }}
                    >✎</button>
                  </>
                )}
                <button
                  type="button"
                  className="gym-delete-btn"
                  onClick={(e) => { e.stopPropagation(); onPlanChange(exercises.filter((_, idx) => idx !== i)); }}
                >×</button>
              </div>
            );
          })}
          <button type="button" className="gym-add-btn" onClick={() => {
            const newEx: GymExercise = { id: generateId(), name: "" };
            const newExercises = [...exercises, newEx];
            onPlanChange(newExercises);
            setEditingNameIdx(newExercises.length - 1);
            setEditingNameVal("");
          }}>
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
  onPlanChange: (dayName: string, exercises: GymExercise[]) => void;
  onProgressChange: (exerciseId: string, history: GymEntry[]) => void;
}

export default function GymTab({ gymPlan, gymProgress, onPlanChange, onProgressChange }: Props) {
  const [editing, setEditing] = useState<GymExercise | null>(null);

  // All unique exercise names across all days — used for suggestions
  const allExerciseNames = Array.from(
    new Set(Object.values(gymPlan).flat().map((ex) => ex.name).filter(Boolean))
  );

  return (
    <div className="tab-panel">
      {GYM_DAYS.map((dayName) => (
        <DayPlanCard
          key={dayName}
          dayName={dayName}
          exercises={gymPlan[dayName] ?? []}
          gymProgress={gymProgress}
          suggestions={allExerciseNames}
          onExerciseTap={setEditing}
          onPlanChange={(exs) => onPlanChange(dayName, exs)}
        />
      ))}

      {editing !== null && (
        <ProgressModal
          name={editing.name}
          history={gymProgress[editing.id] ?? []}
          onAppend={(entry) => {
            const prev = gymProgress[editing.id] ?? [];
            onProgressChange(editing.id, [...prev, entry]);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
