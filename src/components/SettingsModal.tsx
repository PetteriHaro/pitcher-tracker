import { useState, useRef } from "react";
import { getMondayOfWeek, parseISO, toISO } from "../utils/dates";
import { supabase } from "../utils/supabase";
import type { LocalSnapshot } from "../utils/storage";
import type { DayData } from "../types";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  startDate: string;
  data: DayData;
  onClose: () => void;
  onSave: (newStartDate: string) => void;
  onImport: (snapshot: LocalSnapshot) => Promise<void>;
  onReset: () => Promise<void>;
}

function exportData(startDate: string, data: DayData) {
  const payload = { startDate, data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pitcher-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsModal({
  isOpen,
  startDate,
  data,
  onClose,
  onSave,
  onImport,
  onReset,
}: Props) {
  const [value, setValue] = useState(startDate);
  const [importError, setImportError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleSave(close: () => void) {
    const mon = getMondayOfWeek(parseISO(value).toDate());
    onSave(toISO(mon.toDate()));
    close();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string) as LocalSnapshot;
        if (!parsed.startDate && !parsed.data) throw new Error("invalid");
        setImporting(true);
        await onImport(parsed);
        setImporting(false);
        onClose();
      } catch {
        setImporting(false);
        setImportError("Invalid file — could not parse JSON.");
      }
    };
    reader.readAsText(file);
  }

  async function handleReset() {
    await onReset();
    setConfirmReset(false);
    onClose();
  }

  async function handleSignOut() {
    onClose();
    await supabase.auth.signOut();
  }

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={(close) => (
        <>
          <button className="btn-secondary" onClick={close}>
            Cancel
          </button>
          <button className="btn-primary" onClick={() => handleSave(close)}>
            Save
          </button>
        </>
      )}
    >
      <div
        className="field-row"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}
      >
        <label className="field-label">Program start date</label>
        <input
          type="date"
          style={{ width: "100%" }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />

      <div className="section-title" style={{ marginBottom: 10 }}>
        Data
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="btn-secondary" onClick={() => exportData(startDate, data)}>
          Export data (JSON)
        </button>
        <button
          className="btn-secondary"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
        >
          {importing ? "Importing…" : "Import data (JSON)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {importError && (
          <span style={{ fontSize: "0.8rem", color: "var(--red)" }}>{importError}</span>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }} />

        {!confirmReset ? (
          <button className="btn-danger" onClick={() => setConfirmReset(true)}>
            Reset all progress
          </button>
        ) : (
          <div className="reset-confirm">
            <div className="reset-confirm-icon">⚠️</div>
            <p className="reset-confirm-title">Reset everything?</p>
            <p className="reset-confirm-body">
              All training data and your start date will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="reset-confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
                Keep data
              </button>
              <button className="btn-danger-solid" onClick={handleReset}>
                Delete all
              </button>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }} />

        <button className="btn-secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </Modal>
  );
}
