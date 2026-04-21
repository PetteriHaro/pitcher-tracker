import { useState } from "react";
import { Paper, Group, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import type { Day, Throwing } from "../types";
import { MOVEMENT_KEYS, type MovementKey } from "../constants";
import { formatDate, parseISO } from "../utils/dates";
import MovementSection from "./MovementSection";
import ThrowingSection from "./ThrowingSection";
import GymSection from "./GymSection";

interface Props {
  day: Day;
  isToday: boolean;
  onMovementChange: (key: MovementKey, val: boolean) => void;
  onThrowChange: (key: keyof Throwing, val: Throwing[keyof Throwing]) => void;
  onGymToggle: (val: boolean) => void;
  onThrowToggle: (type: "javelin_longtoss" | "mound_bullpen" | null) => void;
  onOpenGymTab: () => void;
}

export default function DayCard({
  day,
  isToday,
  onMovementChange,
  onThrowChange,
  onThrowToggle,
  onGymToggle,
  onOpenGymTab,
}: Props) {
  const [open, setOpen] = useState(isToday);

  const throwType = day.throwing?.type;
  const throwPillLabel =
    throwType === "javelin_longtoss"
      ? "Jav+LT"
      : throwType === "mound_bullpen"
        ? "Mound"
        : null;

  const dateStr = formatDate(parseISO(day.date));

  return (
    <Paper
      withBorder
      radius="md"
      mb="sm"
      style={{
        borderColor: isToday ? "var(--accent2)" : undefined,
      }}
    >
      <Group
        justify="space-between"
        p="md"
        wrap="nowrap"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" wrap="nowrap" align="baseline">
            <Text fw={600}>{day.dayOfWeek}</Text>
            <Text size="sm" c="dimmed">{dateStr}</Text>
          </Group>
          <div className="day-pills" style={{ marginTop: 4 }}>
            <span className="pill pill-move">Move</span>
            {throwPillLabel ? (
              <span className="pill pill-throw">{throwPillLabel}</span>
            ) : (
              <span className="pill pill-rest">Rest</span>
            )}
            {day.gym && <span className="pill pill-gym">Gym</span>}
          </div>
        </div>
        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <div className="progress-dots">
            {MOVEMENT_KEYS.map((k) => (
              <div key={k} className={`dot${day.movement[k] ? " done" : ""}`} />
            ))}
          </div>
          <IconChevronDown
            size={18}
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </Group>
      </Group>

      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          <MovementSection
            movement={day.movement}
            onChange={onMovementChange}
          />
          <ThrowingSection
            throwing={day.throwing}
            onChange={onThrowChange}
            onToggle={onThrowToggle}
          />
          <GymSection gym={day.gym} onToggle={onGymToggle} onOpenGymTab={onOpenGymTab} />
        </div>
      )}
    </Paper>
  );
}
