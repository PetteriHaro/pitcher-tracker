import { useState } from "react";
import { Checkbox, Modal, Button, Group } from "@mantine/core";
import { MOVEMENT_KEYS, MOVEMENT_LABELS, type MovementKey } from "../constants";
import type { Movement } from "../types";
import { MOVEMENT_EXERCISES } from "../movementExercises";

interface Props {
  movement: Movement;
  onChange: (key: MovementKey, val: boolean) => void;
}

function ExerciseModal({
  sectionKey,
  onClose,
}: {
  sectionKey: MovementKey;
  onClose: () => void;
}) {
  const exercises = MOVEMENT_EXERCISES[sectionKey];
  return (
    <Modal opened onClose={onClose} title={MOVEMENT_LABELS[sectionKey]} centered size="md">
      <div className="exercise-list">
        {exercises.map((ex) => (
          <div className="exercise-item" key={ex.name}>
            <div className="exercise-header">
              <span className="exercise-name">{ex.name}</span>
              <span className="exercise-target">{ex.target}</span>
            </div>
            <p className="exercise-desc">{ex.description}</p>
          </div>
        ))}
      </div>
      <Group justify="flex-end" mt="md">
        <Button color="accent" onClick={onClose}>Done</Button>
      </Group>
    </Modal>
  );
}

export default function MovementSection({ movement, onChange }: Props) {
  const [activeSection, setActiveSection] = useState<MovementKey | null>(null);

  return (
    <div className="section">
      <div className="section-title">Movement Practice</div>
      <div className="check-list">
        {MOVEMENT_KEYS.map((key) => (
          <div className="check-row" key={key}>
            <Checkbox
              size="md"
              color="accent"
              label={MOVEMENT_LABELS[key]}
              checked={movement[key]}
              onChange={(e) => onChange(key, e.currentTarget.checked)}
              style={{ flex: 1 }}
            />
            <button
              className="info-btn"
              onClick={() => setActiveSection(key)}
              aria-label={`Show exercises for ${MOVEMENT_LABELS[key]}`}
            >
              ?
            </button>
          </div>
        ))}
      </div>

      {activeSection && (
        <ExerciseModal
          sectionKey={activeSection}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
}
