import { Checkbox } from "@mantine/core";

interface Props {
  gym: boolean;
  onToggle: (val: boolean) => void;
  onOpenGymTab: () => void;
}

export default function GymSection({ gym, onToggle, onOpenGymTab }: Props) {
  return (
    <div className="section">
      <div className="section-title">Gym</div>
      <div className="check-list">
        <div className="check-row">
          <Checkbox
            size="md"
            color="accent"
            label="Done"
            checked={gym}
            onChange={(e) => onToggle(e.currentTarget.checked)}
            style={{ flex: 1 }}
          />
          <button className="gym-open-btn" onClick={onOpenGymTab}>
            Open Gym →
          </button>
        </div>
      </div>
    </div>
  );
}
