import { useState } from "react";
import {
  NumberInput,
  Button,
  Modal,
  Group,
  Paper,
  ActionIcon,
  TextInput,
  Text,
} from "@mantine/core";
import {
  IconPencil,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";
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
              <ActionIcon
                size="xs"
                variant="subtle"
                color="red"
                aria-label="Delete latest entry"
                onClick={() => onDelete(last.id)}
              >
                <IconX size={14} />
              </ActionIcon>
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
              <ActionIcon
                size="xs"
                variant="subtle"
                color="red"
                aria-label="Delete entry"
                onClick={() => onDelete(e.id)}
              >
                <IconX size={14} />
              </ActionIcon>
            </span>
          ))}
        </div>
      )}
      <Group grow gap="md" align="flex-end">
        <NumberInput
          label="Kg"
          value={kg === "" ? "" : Number(kg)}
          onChange={(v) => setKg(v === "" || v === undefined ? "" : String(v))}
          placeholder="—"
          min={0}
          step={0.25}
          decimalScale={2}
          hideControls
        />
        <NumberInput
          label="Reps +/−"
          value={deltaVal ?? ""}
          onChange={(v) => setDeltaVal(v === "" || v === undefined ? null : Number(v))}
          placeholder="—"
          step={1}
          allowDecimal={false}
        />
      </Group>
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
      // If the user's movement matches an exercise they already have on another
      // (or this) day, reuse its id so progress history is shared across days.
      const existing = suggestions.find(
        (s) => s.movement.toLowerCase() === movement.toLowerCase(),
      );
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
    <Paper withBorder radius="md" mb="sm">
      <Group
        justify="space-between"
        p="md"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
      >
        <Group gap="sm">
          <Text fw={600}>{dayName}</Text>
          <Text size="sm" c="dimmed">{exercises.length} exercises</Text>
        </Group>
        <IconChevronDown
          size={18}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </Group>

      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          {exercises.map((ex, i) => {
            const history = gymProgress[ex.id] ?? [];
            const current = history.length > 0 ? formatEntry(history[history.length - 1]) : null;
            const isEditing = editIdx === i;
            return (
              <Paper
                key={ex.id}
                withBorder
                radius="sm"
                p="sm"
                mb={6}
                bg="dark.6"
                onClick={() => { if (!isEditing && ex.movement) onExerciseTap(ex); }}
                style={{ cursor: isEditing ? "default" : "pointer" }}
              >
                {isEditing ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs" align="flex-start" wrap="nowrap" style={{ position: "relative" }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <TextInput
                          size="sm"
                          placeholder="Movement (e.g. Lateral raise)"
                          value={editMovement}
                          onChange={(e) => { setEditMovement(e.currentTarget.value); setShowSuggestions(true); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { commit(i); setShowSuggestions(false); } if (e.key === "Escape") { setEditIdx(null); setShowSuggestions(false); } }}
                          autoFocus
                        />
                        <TextInput
                          size="sm"
                          placeholder="Sets (e.g. 4x10)"
                          value={editSets}
                          onChange={(e) => setEditSets(e.currentTarget.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { commit(i); setShowSuggestions(false); } if (e.key === "Escape") { setEditIdx(null); setShowSuggestions(false); } }}
                        />
                      </div>
                    </Group>
                    {showSuggestions && (() => {
                      const q = editMovement.trim().toLowerCase();
                      if (q === "") return null;
                      const matches = suggestions.filter((s) => s.movement.toLowerCase().includes(q) && s.movement !== editMovement);
                      return matches.length > 0 ? (
                        <Paper withBorder mt={4} p={4}>
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
                        </Paper>
                      ) : null;
                    })()}
                    <Group justify="space-between" mt="xs">
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => {
                          onPlanChange(exercises.filter((_, idx) => idx !== i));
                          setEditIdx(null);
                        }}
                      >
                        Delete
                      </Button>
                      <Group gap="xs">
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => setEditIdx(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="accent"
                          size="xs"
                          onClick={() => { commit(i); setShowSuggestions(false); }}
                        >
                          Save
                        </Button>
                      </Group>
                    </Group>
                  </div>
                ) : (
                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Group gap={2} wrap="nowrap">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        disabled={i === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = [...exercises];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          onPlanChange(next);
                        }}
                        aria-label="Move up"
                      >
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        disabled={i === exercises.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = [...exercises];
                          [next[i], next[i + 1]] = [next[i + 1], next[i]];
                          onPlanChange(next);
                        }}
                        aria-label="Move down"
                      >
                        <IconArrowDown size={16} />
                      </ActionIcon>
                    </Group>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {ex.movement ? (
                        <>
                          <Text size="sm" fw={500} truncate>{ex.movement}</Text>
                          {ex.sets && <Text size="xs" c="dimmed">{ex.sets}</Text>}
                        </>
                      ) : (
                        <Text size="sm" c="dimmed" fs="italic">Unnamed</Text>
                      )}
                    </div>
                    <Text size="sm" c="amber.5" fw={600} className="gym-progress-weights">
                      {current ?? <Text component="span" size="sm" c="dimmed">—</Text>}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color="accent"
                      onClick={(e) => { e.stopPropagation(); startEdit(i); }}
                      aria-label="Edit exercise"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </Paper>
            );
          })}
          <Button
            variant="light"
            fullWidth
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              const newEx: GymExercise = { id: generateId(), movement: "" };
              const newExercises = [...exercises, newEx];
              onPlanChange(newExercises);
              setEditIdx(newExercises.length - 1);
              setEditMovement("");
              setEditSets("");
            }}
          >
            Add exercise
          </Button>
        </div>
      )}
    </Paper>
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
