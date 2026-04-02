import { useState } from 'react'
import type { Milestone } from '../types'
import Toggle from './Toggle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (m: Omit<Milestone, 'id'>) => void
  currentWeekNumber: number
  todayISO: string
}

const blank = {
  longTossMax: '',
  velocity: '',
  wallSlideRange: '',
  bridgeDepth: '',
  pikeHold: '',
  deepSquatComfortable: false,
  ankleDorsiflexion: '',
}

export default function MilestoneModal({ isOpen, onClose, onSave, currentWeekNumber, todayISO }: Props) {
  const [fields, setFields] = useState(blank)

  if (!isOpen) return null

  function set<K extends keyof typeof blank>(key: K, val: (typeof blank)[K]) {
    setFields(prev => ({ ...prev, [key]: val }))
  }

  function handleSave() {
    onSave({
      date: todayISO,
      weekNumber: currentWeekNumber,
      longTossMax: fields.longTossMax !== '' ? +fields.longTossMax : null,
      velocity: fields.velocity !== '' ? +fields.velocity : null,
      wallSlideRange: fields.wallSlideRange,
      bridgeDepth: fields.bridgeDepth,
      pikeHold: fields.pikeHold !== '' ? +fields.pikeHold : null,
      deepSquatComfortable: fields.deepSquatComfortable,
      ankleDorsiflexion: fields.ankleDorsiflexion !== '' ? +fields.ankleDorsiflexion : null,
    })
    setFields(blank)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Log Progress Milestone</div>

        <div className="field-row">
          <label className="field-label">Long toss consistent max (m)</label>
          <input type="number" min={0} max={200} placeholder="m"
            value={fields.longTossMax}
            onChange={e => set('longTossMax', e.target.value)} />
        </div>
        <div className="field-row">
          <label className="field-label">
            Velocity (mph) <span className="field-sub">optional</span>
          </label>
          <input type="number" min={0} max={120} placeholder="mph"
            value={fields.velocity}
            onChange={e => set('velocity', e.target.value)} />
        </div>
        <div className="field-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="field-label">Wall slide end range</label>
          <input type="text" placeholder="e.g. full ROM, slight restriction..."
            style={{ width: '100%', marginTop: 6 }}
            value={fields.wallSlideRange}
            onChange={e => set('wallSlideRange', e.target.value)} />
        </div>
        <div className="field-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="field-label">Bridge depth</label>
          <input type="text" placeholder="e.g. nose to floor, hips fully up..."
            style={{ width: '100%', marginTop: 6 }}
            value={fields.bridgeDepth}
            onChange={e => set('bridgeDepth', e.target.value)} />
        </div>
        <div className="field-row">
          <label className="field-label">Pike hold duration (sec)</label>
          <input type="number" min={0} max={300} placeholder="sec"
            value={fields.pikeHold}
            onChange={e => set('pikeHold', e.target.value)} />
        </div>
        <Toggle
          label="Deep squat comfortable"
          checked={fields.deepSquatComfortable}
          onChange={val => set('deepSquatComfortable', val)}
        />
        <div className="field-row">
          <label className="field-label">Ankle dorsiflexion from wall (cm)</label>
          <input type="number" min={0} max={30} placeholder="cm"
            value={fields.ankleDorsiflexion}
            onChange={e => set('ankleDorsiflexion', e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
