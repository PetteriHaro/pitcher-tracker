import { useState } from "react";
import { Checkbox, Modal, Button, Group, Paper, ActionIcon } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { MOVEMENT_KEYS, MOVEMENT_LABELS, type MovementKey } from "../constants";
import type { Movement } from "../types";
import { MOVEMENT_EXERCISES } from "../movementExercises";

interface Props {
  movement: Movement;
  onChange: (key: MovementKey, val: boolean) => void;
}

export default function MovementSection({ movement, onChange }: Props) {
  const [activeSection, setActiveSection] = useState<MovementKey | null>(null);
  // Remembered section lingers during the modal's close animation
  // so the title + content don't flash empty on the way out.
  const [displayedSection, setDisplayedSection] = useState<MovementKey | null>(null);

  function openSection(key: MovementKey) {
    setDisplayedSection(key);
    setActiveSection(key);
  }

  const exercises = displayedSection ? MOVEMENT_EXERCISES[displayedSection] : [];

  return (
    <Paper withBorder p="md" radius="md" mt="md" bg="dark.6">
      <div className="section-title" style={{ marginBottom: 10 }}>Movement Practice</div>
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
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => openSection(key)}
              aria-label={`Show exercises for ${MOVEMENT_LABELS[key]}`}
            >
              <IconInfoCircle size={18} />
            </ActionIcon>
          </div>
        ))}
      </div>

      <Modal
        opened={activeSection !== null}
        onClose={() => setActiveSection(null)}
        title={displayedSection ? MOVEMENT_LABELS[displayedSection] : ""}
        centered
        size="md"
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
        <Group justify="flex-end" mt="md">
          <Button color="accent" onClick={() => setActiveSection(null)}>Done</Button>
        </Group>
      </Modal>
    </Paper>
  );
}
