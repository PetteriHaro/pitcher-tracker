import { useState } from 'react'
import { getMondayOfWeek, parseISO, toISO } from '../utils/dates'

interface Props {
  isOpen: boolean
  startDate: string
  onClose: () => void
  onSave: (newStartDate: string) => void
}

export default function SettingsModal({ isOpen, startDate, onClose, onSave }: Props) {
  const [value, setValue] = useState(startDate)

  if (!isOpen) return null

  function handleSave() {
    const mon = getMondayOfWeek(parseISO(value).toDate())
    onSave(toISO(mon.toDate()))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Settings</div>
        <div className="field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <label className="field-label">Program start date</label>
          <input type="date" style={{ width: '100%' }} value={value}
            onChange={e => setValue(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
