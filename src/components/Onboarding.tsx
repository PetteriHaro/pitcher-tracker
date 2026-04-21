import { useState } from "react";
import { SegmentedControl, Checkbox, TextInput, Button, Stack, Text, Paper } from "@mantine/core";
import { getMondayOfWeek, parseISO, toISO } from "../utils/dates";
import { supabase } from "../utils/supabase";
import { DAY_NAMES } from "../constants";
import type { Schedule, ThrowType } from "../types";

interface Props {
  initialName: string;
  schedule: Schedule;
  onScheduleChange: (day: string, cfg: { throwType: ThrowType; gym: boolean }) => void;
  onComplete: (startDateISO: string) => void;
}

type Step = 1 | 2 | 3;

const THROW_OPTIONS: { value: ThrowType; label: string }[] = [
  { value: "rest", label: "Rest" },
  { value: "javelin_longtoss", label: "Jav + LT" },
  { value: "mound_bullpen", label: "Mound" },
];

export default function Onboarding({
  initialName,
  schedule,
  onScheduleChange,
  onComplete,
}: Props) {
  const [step, setStep] = useState<Step>(initialName ? 2 : 1);
  const [name, setName] = useState(initialName);
  const [startDate, setStartDate] = useState("2026-03-31");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveName() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    setSaving(true); setError("");
    const { error: err } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });
    setSaving(false);
    if (err) setError(err.message);
    else setStep(2);
  }

  function finish() {
    if (!startDate) return;
    const mon = getMondayOfWeek(parseISO(startDate).toDate());
    onComplete(toISO(mon.toDate()));
  }

  if (step === 1) {
    return (
      <div className="onboarding">
        <div className="onboarding-step-indicator">Step 1 of 3</div>
        <h1>Welcome 👋</h1>
        <p>Let's get you set up. What should we call you?</p>
        <Paper className="onboarding-inner" p="lg" radius="md" withBorder>
          <Stack gap="sm">
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
            <Button color="accent" loading={saving} onClick={saveName} fullWidth>
              Next →
            </Button>
            {error && <Text size="sm" c="red">{error}</Text>}
            <Button variant="default" onClick={() => supabase.auth.signOut()} fullWidth>
              Sign out
            </Button>
          </Stack>
        </Paper>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="onboarding">
        <div className="onboarding-step-indicator">Step 2 of 3</div>
        <h1>Weekly schedule</h1>
        <p>Pick your throwing type and gym days. You can change these later.</p>
        <Paper className="onboarding-inner" p="lg" radius="md" withBorder>
          <div className="schedule-editor" style={{ marginBottom: 24 }}>
            {DAY_NAMES.map((day) => {
              const cfg = schedule[day] ?? { throwType: "rest" as ThrowType, gym: false };
              return (
                <div key={day} className="schedule-row">
                  <span className="schedule-day">{day}</span>
                  <SegmentedControl
                    size="xs"
                    color="accent"
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
          <Stack gap="xs">
            <Button color="accent" onClick={() => setStep(3)} fullWidth>
              Next →
            </Button>
            <Button
              variant="default"
              onClick={() => setStep(initialName ? 2 : 1)}
              disabled={!initialName}
              fullWidth
            >
              ← Back
            </Button>
          </Stack>
        </Paper>
      </div>
    );
  }

  // step === 3
  return (
    <div className="onboarding">
      <div className="onboarding-step-indicator">Step 3 of 3</div>
      <h1>Program start date</h1>
      <p>The Monday your program begins. Used to calculate week numbers.</p>
      <Paper className="onboarding-inner" p="lg" radius="md" withBorder>
        <Stack gap="sm">
          <TextInput
            label="Start Monday"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.currentTarget.value)}
          />
          <Button color="accent" onClick={finish} fullWidth>
            Get Started
          </Button>
          <Button variant="default" onClick={() => setStep(2)} fullWidth>
            ← Back
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
