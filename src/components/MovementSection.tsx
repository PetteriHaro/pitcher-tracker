import { useState } from "react";
import { MOVEMENT_KEYS, MOVEMENT_LABELS, type MovementKey } from "../constants";
import type { Movement } from "../types";
import { MOVEMENT_EXERCISES } from "../movementExercises";
import Modal from "./Modal";

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
    <Modal
      title={MOVEMENT_LABELS[sectionKey]}
      onClose={onClose}
      footer={
        <button className="btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
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
            <label className="check-item">
              <input
                type="checkbox"
                checked={movement[key]}
                onChange={(e) => onChange(key, e.target.checked)}
              />
              <div className="check-box" />
              <span className="check-label">{MOVEMENT_LABELS[key]}</span>
            </label>
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
