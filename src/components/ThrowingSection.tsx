import type { Throwing } from '../types'
import { INTENSITY_OPTIONS } from '../constants'
import Toggle from './Toggle'

interface Props {
  throwing: Throwing | null
  onChange: (key: keyof Throwing, val: Throwing[keyof Throwing]) => void
}

export default function ThrowingSection({ throwing, onChange }: Props) {
  if (!throwing) {
    return <p className="rest-msg">Rest day — movement practice only</p>
  }

  const isJavelin = throwing.type === 'javelin_longtoss'

  return (
    <div className="section">
      <div className="section-title">
        {isJavelin ? 'Javelin + Long Toss' : 'Mound / Bullpen'}
      </div>

      {isJavelin && (
        <Toggle
          label="Javelin done"
          checked={!!throwing.javelinDone}
          onChange={val => onChange('javelinDone', val)}
        />
      )}

      <div className="field-row">
        <span className="field-label">Working throws</span>
        <input
          type="number"
          min={0}
          max={500}
          value={throwing.workingThrows}
          placeholder="0"
          onChange={e => onChange('workingThrows', e.target.value === '' ? '' : +e.target.value)}
        />
      </div>

      {isJavelin && (
        <div className="field-row">
          <span className="field-label">Max distance (m)</span>
          <input
            type="number"
            min={0}
            max={200}
            value={throwing.longTossMaxDistance ?? ''}
            placeholder="0"
            onChange={e =>
              onChange('longTossMaxDistance', e.target.value === '' ? '' : +e.target.value)
            }
          />
        </div>
      )}

      {!isJavelin && (
        <div className="field-row">
          <span className="field-label">Intensity</span>
          <select
            value={throwing.intensity ?? '70-80%'}
            onChange={e => onChange('intensity', e.target.value as Throwing['intensity'])}
          >
            {INTENSITY_OPTIONS.map(opt => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      <Toggle
        label="Post-throw recovery"
        checked={throwing.postThrowRecovery}
        onChange={val => onChange('postThrowRecovery', val)}
      />

      <div className="section-title" style={{ marginTop: 10 }}>Notes</div>
      <textarea
        placeholder="Optional notes..."
        value={throwing.notes}
        onChange={e => onChange('notes', e.target.value)}
      />
    </div>
  )
}
