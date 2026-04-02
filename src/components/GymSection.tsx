import type { Gym } from '../types'
import Toggle from './Toggle'

interface Props {
  gym: Gym | null
  onChange: (key: keyof Gym, val: Gym[keyof Gym]) => void
}

export default function GymSection({ gym, onChange }: Props) {
  if (!gym) return null

  return (
    <div className="section">
      <div className="section-title">Gym</div>
      <Toggle
        label="Gym done"
        checked={gym.done}
        onChange={val => onChange('done', val)}
      />
      <textarea
        placeholder="Optional notes..."
        value={gym.notes}
        onChange={e => onChange('notes', e.target.value)}
      />
    </div>
  )
}
