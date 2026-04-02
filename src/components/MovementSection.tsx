import { MOVEMENT_KEYS, MOVEMENT_LABELS, type MovementKey } from '../constants'
import type { Movement } from '../types'

interface Props {
  movement: Movement
  onChange: (key: MovementKey, val: boolean) => void
}

export default function MovementSection({ movement, onChange }: Props) {
  return (
    <div className="section">
      <div className="section-title">Movement Practice</div>
      <div className="check-list">
        {MOVEMENT_KEYS.map(key => (
          <label className="check-item" key={key}>
            <input
              type="checkbox"
              checked={movement[key]}
              onChange={e => onChange(key, e.target.checked)}
            />
            <div className="check-box" />
            <span className="check-label">{MOVEMENT_LABELS[key]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
