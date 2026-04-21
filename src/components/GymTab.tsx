import { useState } from "react";
import { NumberInput, Button, Modal, Group } from "@mantine/core";
import type { GymExercise, GymPlan, GymProgress, GymEntry, Schedule } from "../types";
import { DAY_NAMES } from "../constants";

function generateId(): string {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatEntry(e: GymEntry): string {
  const parts: string[] = [];
  if (e.kg !== undefined) parts.push(`${e.kg}kg`);
  if (e.delta !== undefined && e.sign !== undefined) parts.push(`${e.sign}${e.delta}`);
  return parts.join(" ");
}

function formatExerciseLabel(ex: GymExercise): string {
  return ex.sets ? `${ex.movement}, ${ex.sets}` : ex.movement;
}

function ProgressModal({
  exercise,
  history,
  onAppend,
  onDelete,
  onClose,
}: {
  exercise: GymExercise;
  history: GymEntry[];
  onAppend: (entry: GymEntry) => void;
  onDelete: (entryId: string) => void;
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
    const delta = deltaVal !== null && deltaVal !== 0 ? deltaVal : null;
    if (kgNum === undefined && delta === null) return null;
    const entry: GymEntry = { id: crypto.randomUUID() };
    if (kgNum !== undefined) entry.kg = kgNum;
    if (delta !== null) {
      entry.sign = delta > 0 ? "+" : "-";
      entry.delta = Math.abs(delta);
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
    <Modal
      opened
      onClose={onClose}
      title={
        <div>
          <div style={{ fontWeight: 600 }}>{formatExerciseLabel(exercise)}</div>
          {current && last && (
            <div className="gym-modal-current" style={{ marginTop: 4 }}>
              <span>{current}</span>
              <button
                type="button"
                className="gym-history-del"
                aria-label="Delete latest entry"
                onClick={() => onDelete(last.id)}
              >×</button>
            </div>
          )}
        </div>
      }
      centered
      size="md"
    >
      {history.length > 1 && (
        <div className="gym-history-strip">
          {history.slice(0, -1).map((e) => (
            <span key={e.id} className="gym-history-chip">
              {formatEntry(e)}
              <button
                type="button"
                className="gym-history-del"
                aria-label="Delete entry"
                onClick={() => onDelete(e.id)}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <div className="gym-entry-row">
        <div className="gym-entry-field">
          <label className="gym-entry-label">Kg</label>
          <NumberInput
            value={kg === "" ? "" : Number(kg)}
            onChange={(v) => setKg(v === "" || v === undefined ? "" : String(v))}
            placeholder="—"
            min={0}
            step={0.25}
            decimalScale={2}
            hideControls
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
      <Group justify="flex-end" gap="xs" mt="md">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button
          color="accent"
          onClick={() => { if (entry) { onAppend(entry); onClose(); } }}
          disabled={!entry}
        >
          Append
        </Button>
      </Group>
    </Modal>
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
  suggestions: GymExercise[];
  onExerciseTap: (exercise: GymExercise) => void;
  onPlanChange: (exercises: GymExercise[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editMovement, setEditMovement] = useState("");
  const [editSets, setEditSets] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function startEdit(i: number) {
    setEditIdx(i);
    setEditMovement(exercises[i].movement);
    setEditSets(exercises[i].sets ?? "");
  }

  function commit(i: number) {
    const movement = editMovement.trim();
    const sets = editSets.trim();
    if (movement === "") {
      onPlanChange(exercises.filter((_, idx) => idx !== i));
    } else {
      // Reuse an existing exercise's ID if movement matches a known one,
      // so history is preserved when re-adding.
      const existing = suggestions.find((s) => s.movement.toLowerCase() === movement.toLowerCase());
      onPlanChange(exercises.map((ex, idx) =>
        idx === i
          ? existing
            ? { ...existing, sets: sets || existing.sets }
            : { ...ex, movement, sets: sets || undefined }
          : ex,
      ));
    }
    setEditIdx(null);
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
            const isEditing = editIdx === i;
            return (
              <div key={ex.id} className="gym-plan-row" onClick={() => { if (!isEditing && ex.movement) onExerciseTap(ex); }}>
                {isEditing ? (
                  <div className="gym-edit-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="gym-name-input"
                      placeholder="Movement (e.g. Lateral raise)"
                      value={editMovement}
                      onChange={(e) => { setEditMovement(e.target.value); setShowSuggestions(true); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { commit(i); setShowSuggestions(false); } if (e.key === "Escape") { setEditIdx(null); setShowSuggestions(false); } }}
                      autoFocus
                    />
                    <input
                      className="gym-sets-input"
                      placeholder="Sets (e.g. 4x10)"
                      value={editSets}
                      onChange={(e) => setEditSets(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { commit(i); setShowSuggestions(false); } if (e.key === "Escape") { setEditIdx(null); setShowSuggestions(false); } }}
                    />
                    <div className="gym-edit-actions">
                      <Button variant="default" size="sm" onClick={() => setEditIdx(null)}>Cancel</Button>
                      <Button color="accent" size="sm" onClick={() => { commit(i); setShowSuggestions(false); }}>Save</Button>
                    </div>
                    {showSuggestions && (() => {
                      const q = editMovement.trim().toLowerCase();
                      if (q === "") return null;
                      const matches = suggestions.filter((s) => s.movement.toLowerCase().includes(q) && s.movement !== editMovement);
                      return matches.length > 0 ? (
                        <div className="gym-suggestions">
                          {matches.map((s) => (
                            <div
                              key={s.id}
                              className="gym-suggestion-item"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setEditMovement(s.movement);
                                setEditSets(s.sets ?? "");
                                setShowSuggestions(false);
                              }}
                            >
                              {formatExerciseLabel(s)}
                            </div>
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
                    <div className="gym-progress-name">
                      {ex.movement ? (
                        <>
                          <span className="gym-ex-movement">{ex.movement}</span>
                          {ex.sets && <span className="gym-ex-sets">{ex.sets}</span>}
                        </>
                      ) : (
                        <span style={{ color: "var(--border)" }}>Unnamed</span>
                      )}
                    </div>
                    <span className="gym-progress-weights">{current ?? <span style={{ color: "var(--border)" }}>—</span>}</span>
                    <button
                      type="button"
                      className="gym-edit-name-btn"
                      onClick={(e) => { e.stopPropagation(); startEdit(i); }}
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
            const newEx: GymExercise = { id: generateId(), movement: "" };
            const newExercises = [...exercises, newEx];
            onPlanChange(newExercises);
            setEditIdx(newExercises.length - 1);
            setEditMovement("");
            setEditSets("");
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
  schedule: Schedule;
  onPlanChange: (dayName: string, exercises: GymExercise[]) => void;
  onEntryAppend: (exerciseId: string, entry: GymEntry) => void;
  onEntryDelete: (exerciseId: string, entryId: string) => void;
}

export default function GymTab({ gymPlan, gymProgress, schedule, onPlanChange, onEntryAppend, onEntryDelete }: Props) {
  const [editing, setEditing] = useState<GymExercise | null>(null);

  // Days the user has marked as gym days, in week order
  const gymDays = DAY_NAMES.filter((name) => schedule[name]?.gym);

  // All unique exercises across all days (deduplicated by id) — used for suggestions
  const allExercises = Object.values(
    Object.values(gymPlan).flat().reduce<Record<string, GymExercise>>((acc, ex) => {
      if (ex.movement && !acc[ex.id]) acc[ex.id] = ex;
      return acc;
    }, {})
  );

  return (
    <div className="tab-panel">
      {gymDays.length === 0 && (
        <p style={{ color: "var(--text2)", textAlign: "center", marginTop: 16 }}>
          No gym days configured. Open Settings ⚙️ to edit your schedule.
        </p>
      )}
      {gymDays.map((dayName) => (
        <DayPlanCard
          key={dayName}
          dayName={dayName}
          exercises={gymPlan[dayName] ?? []}
          gymProgress={gymProgress}
          suggestions={allExercises}
          onExerciseTap={setEditing}
          onPlanChange={(exs) => onPlanChange(dayName, exs)}
        />
      ))}

      {editing !== null && (
        <ProgressModal
          exercise={editing}
          history={gymProgress[editing.id] ?? []}
          onAppend={(entry) => onEntryAppend(editing.id, entry)}
          onDelete={(entryId) => onEntryDelete(editing.id, entryId)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
