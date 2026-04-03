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
          <label className="check-item">
            <input
              type="checkbox"
              checked={gym}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div className="check-box" />
            <span className="check-label">Done</span>
          </label>
          <button className="gym-open-btn" onClick={onOpenGymTab}>
            Open Gym →
          </button>
        </div>
      </div>
    </div>
  );
}
