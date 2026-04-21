import { useState } from "react";
import { Checkbox, NumberInput, Select, Button, Modal, Group } from "@mantine/core";
import type { Throwing } from "../types";
import { INTENSITY_OPTIONS } from "../constants";
import { JAVELIN_PROGRAM, POST_THROW_RECOVERY } from "../throwingExercises";

interface Props {
  throwing: Throwing | null;
  onChange: (key: keyof Throwing, val: Throwing[keyof Throwing]) => void;
  onToggle: (type: "javelin_longtoss" | "mound_bullpen" | null) => void;
}

export default function ThrowingSection({ throwing, onChange, onToggle }: Props) {
  const [showRecovery, setShowRecovery] = useState(false);
  const [showJavelin, setShowJavelin] = useState(false);

  if (!throwing) {
    return (
      <div className="section">
        <div className="section-title">Throwing</div>
        <div className="add-session-btns">
          <Button
            variant="light"
            color="accent"
            onClick={() => onToggle("javelin_longtoss")}
          >
            + Jav + LT
          </Button>
          <Button
            variant="light"
            color="accent"
            onClick={() => onToggle("mound_bullpen")}
          >
            + Mound
          </Button>
        </div>
      </div>
    );
  }

  const isJavelin = throwing.type === "javelin_longtoss";

  return (
    <div className="section">
      <div className="section-header-row">
        <div className="throw-type-tabs">
          <button
            className={`throw-type-tab${isJavelin ? " active" : ""}`}
            onClick={() => onToggle("javelin_longtoss")}
          >
            Jav + LT
          </button>
          <button
            className={`throw-type-tab${!isJavelin ? " active" : ""}`}
            onClick={() => onToggle("mound_bullpen")}
          >
            Mound
          </button>
        </div>
        <button className="btn-remove-section" onClick={() => onToggle(null)}>
          Remove
        </button>
      </div>

      {isJavelin && (
        <div className="check-row">
          <Checkbox
            size="md"
            color="accent"
            label="Javelin"
            checked={!!throwing.javelinDone}
            onChange={(e) => onChange("javelinDone", e.currentTarget.checked)}
            style={{ flex: 1 }}
          />
          <button
            className="info-btn"
            onClick={() => setShowJavelin(true)}
            aria-label="Show javelin program"
          >
            ?
          </button>
        </div>
      )}

      <div className="field-row">
        <span className="field-label">Working throws</span>
        <NumberInput
          min={0}
          max={500}
          value={throwing.workingThrows === "" ? "" : throwing.workingThrows}
          placeholder="0"
          hideControls
          onChange={(v) =>
            onChange(
              "workingThrows",
              v === "" || v === undefined ? "" : Number(v),
            )
          }
          style={{ width: 110 }}
        />
      </div>

      {isJavelin && (
        <div className="field-row">
          <span className="field-label">Max distance (m)</span>
          <NumberInput
            min={0}
            max={200}
            value={throwing.longTossMaxDistance === "" ? "" : (throwing.longTossMaxDistance ?? "")}
            placeholder="0"
            hideControls
            onChange={(v) =>
              onChange(
                "longTossMaxDistance",
                v === "" || v === undefined ? "" : Number(v),
              )
            }
            style={{ width: 110 }}
          />
        </div>
      )}

      {!isJavelin && (
        <div className="field-row">
          <span className="field-label">Intensity</span>
          <Select
            value={throwing.intensity ?? "70-80%"}
            onChange={(v) =>
              v && onChange("intensity", v as Throwing["intensity"])
            }
            data={INTENSITY_OPTIONS.map((o) => ({ value: o, label: o }))}
            allowDeselect={false}
            style={{ width: 140 }}
          />
        </div>
      )}

      <div className="check-row">
        <Checkbox
          size="md"
          color="accent"
          label="Post-throw recovery"
          checked={throwing.postThrowRecovery}
          onChange={(e) => onChange("postThrowRecovery", e.currentTarget.checked)}
          style={{ flex: 1 }}
        />
        <button
          className="info-btn"
          onClick={() => setShowRecovery(true)}
          aria-label="Show post-throw recovery exercises"
        >
          ?
        </button>
      </div>

      <Modal
        opened={showJavelin}
        onClose={() => setShowJavelin(false)}
        title="Javelin Program"
        centered
        size="md"
      >
        <div className="exercise-list">
          {JAVELIN_PROGRAM.map((ex) => (
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
          <Button color="accent" onClick={() => setShowJavelin(false)}>Done</Button>
        </Group>
      </Modal>

      <Modal
        opened={showRecovery}
        onClose={() => setShowRecovery(false)}
        title="Post-Throw Recovery"
        centered
        size="md"
      >
        <div className="exercise-list">
          {POST_THROW_RECOVERY.map((ex) => (
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
          <Button color="accent" onClick={() => setShowRecovery(false)}>Done</Button>
        </Group>
      </Modal>
    </div>
  );
}
