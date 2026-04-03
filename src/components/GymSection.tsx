interface Props {
  gym: boolean;
  onToggle: (val: boolean) => void;
}

export default function GymSection({ gym, onToggle }: Props) {
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
            <span className="check-label">Gym</span>
          </label>
        </div>
      </div>
    </div>
  );
}
