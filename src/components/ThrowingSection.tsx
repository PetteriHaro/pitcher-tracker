import { useState } from "react";
import type { Throwing } from "../types";
import { INTENSITY_OPTIONS } from "../constants";
import Modal from "./Modal";
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
          <button
            className="btn-add-session"
            onClick={() => onToggle("javelin_longtoss")}
          >
            + Jav + LT
          </button>
          <button
            className="btn-add-session"
            onClick={() => onToggle("mound_bullpen")}
          >
            + Mound
          </button>
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
          <label className="check-item">
            <input
              type="checkbox"
              checked={!!throwing.javelinDone}
              onChange={(e) => onChange("javelinDone", e.target.checked)}
            />
            <div className="check-box" />
            <span className="check-label">Javelin</span>
          </label>
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
        <input
          type="number"
          min={0}
          max={500}
          value={throwing.workingThrows}
          placeholder="0"
          onChange={(e) =>
            onChange(
              "workingThrows",
              e.target.value === "" ? "" : +e.target.value,
            )
          }
        />
      </div>

      {isJavelin && (
        <div className="field-row">
          <span className="field-label">Max distance (m)</span>
          <input
            type="number"
            min={0}
            max={200}
            value={throwing.longTossMaxDistance ?? ""}
            placeholder="0"
            onChange={(e) =>
              onChange(
                "longTossMaxDistance",
                e.target.value === "" ? "" : +e.target.value,
              )
            }
          />
        </div>
      )}

      {!isJavelin && (
        <div className="field-row">
          <span className="field-label">Intensity</span>
          <select
            value={throwing.intensity ?? "70-80%"}
            onChange={(e) =>
              onChange("intensity", e.target.value as Throwing["intensity"])
            }
          >
            {INTENSITY_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      <div className="check-row">
        <label className="check-item">
          <input
            type="checkbox"
            checked={throwing.postThrowRecovery}
            onChange={(e) => onChange("postThrowRecovery", e.target.checked)}
          />
          <div className="check-box" />
          <span className="check-label">Post-throw recovery</span>
        </label>
        <button
          className="info-btn"
          onClick={() => setShowRecovery(true)}
          aria-label="Show post-throw recovery exercises"
        >
          ?
        </button>
      </div>

      {showJavelin && (
        <Modal
          title="Javelin Program"
          onClose={() => setShowJavelin(false)}
          footer={(close) => (
            <button className="btn-primary" onClick={close}>
              Done
            </button>
          )}
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
        </Modal>
      )}

      {showRecovery && (
        <Modal
          title="Post-Throw Recovery"
          onClose={() => setShowRecovery(false)}
          footer={(close) => (
            <button className="btn-primary" onClick={close}>
              Done
            </button>
          )}
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
        </Modal>
      )}
    </div>
  );
}
