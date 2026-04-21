import { useState } from "react";
import { useForm, hasLength } from "@mantine/form";
import {
  SegmentedControl,
  Checkbox,
  PasswordInput,
  Button,
  Stack,
  Text,
  Group,
  Modal,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { getMondayOfWeek, parseISO, toISO } from "../utils/dates";
import { supabase } from "../utils/supabase";
import type { Schedule, ThrowType } from "../types";
import { DAY_NAMES } from "../constants";

interface Props {
  isOpen: boolean;
  startDate: string;
  schedule: Schedule;
  onClose: () => void;
  onSave: (newStartDate: string) => void;
  onScheduleChange: (dayName: string, cfg: { throwType: ThrowType; gym: boolean }) => void;
}

const THROW_OPTIONS: { value: ThrowType; label: string }[] = [
  { value: "rest", label: "Rest" },
  { value: "javelin_longtoss", label: "Jav + LT" },
  { value: "mound_bullpen", label: "Mound" },
];

export default function SettingsModal({
  isOpen,
  startDate,
  schedule,
  onClose,
  onSave,
  onScheduleChange,
}: Props) {
  const [value, setValue] = useState(startDate);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwInfo, setPwInfo] = useState("");

  const pwForm = useForm({
    initialValues: { password: "" },
    validate: { password: hasLength({ min: 8 }, "At least 8 characters") },
  });

  function handleSave() {
    const mon = getMondayOfWeek(parseISO(value).toDate());
    onSave(toISO(mon.toDate()));
    onClose();
  }

  async function handleSignOut() {
    onClose();
    await supabase.auth.signOut();
  }

  async function handleChangePassword(values: { password: string }) {
    setPwError(""); setPwInfo("");
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) setPwError(error.message);
    else {
      setPwInfo("Password updated.");
      pwForm.reset();
      setShowPwForm(false);
    }
  }

  return (
    <Modal opened={isOpen} onClose={onClose} title="Settings" centered size="md">
      <DatePickerInput
        label="Program start date"
        value={value ? new Date(value) : null}
        onChange={(d) => {
          if (!d) return;
          const date = typeof d === "string" ? new Date(d) : d;
          const iso = date.toISOString().slice(0, 10);
          setValue(iso);
        }}
        firstDayOfWeek={1}
        valueFormat="YYYY-MM-DD"
      />

      <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />

      <div className="section-title" style={{ marginBottom: 10 }}>Schedule</div>
      <div className="schedule-editor">
        {DAY_NAMES.map((day) => {
          const cfg = schedule[day] ?? { throwType: "rest" as ThrowType, gym: false };
          return (
            <div key={day} className="schedule-row">
              <span className="schedule-day">{day}</span>
              <SegmentedControl
                size="xs"
                color="accent"
                fullWidth
                value={cfg.throwType}
                onChange={(v) =>
                  onScheduleChange(day, { throwType: v as ThrowType, gym: cfg.gym })
                }
                data={THROW_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                style={{ flex: 1 }}
              />
              <Checkbox
                size="sm"
                color="accent"
                label="Gym"
                checked={cfg.gym}
                onChange={(e) =>
                  onScheduleChange(day, {
                    throwType: cfg.throwType,
                    gym: e.currentTarget.checked,
                  })
                }
              />
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />

      <div className="section-title" style={{ marginBottom: 10 }}>Account</div>
      <Stack gap="xs">
        <Button
          variant="default"
          onClick={() => { setShowPwForm(true); setPwInfo(""); setPwError(""); pwForm.reset(); }}
        >
          Set / change password
        </Button>
        {pwInfo && <Text size="sm" c="green">{pwInfo}</Text>}
        <Button variant="default" onClick={handleSignOut}>Sign out</Button>
      </Stack>

      <Group justify="flex-end" gap="xs" mt="lg">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button color="accent" onClick={handleSave}>Save</Button>
      </Group>

      <Modal
        opened={showPwForm}
        onClose={() => { setShowPwForm(false); pwForm.reset(); setPwError(""); }}
        title="Change password"
        centered
        size="sm"
      >
        <form onSubmit={pwForm.onSubmit(handleChangePassword)}>
          <Stack gap="sm">
            <PasswordInput
              placeholder="New password (min 8 chars)"
              autoComplete="new-password"
              autoFocus
              {...pwForm.getInputProps("password")}
            />
            {pwError && <Text size="sm" c="red">{pwError}</Text>}
            <Group justify="flex-end" gap="xs">
              <Button
                variant="default"
                onClick={() => { setShowPwForm(false); pwForm.reset(); setPwError(""); }}
              >
                Cancel
              </Button>
              <Button type="submit" color="accent">Save password</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Modal>
  );
}
