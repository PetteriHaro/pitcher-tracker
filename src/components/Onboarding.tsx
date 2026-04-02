import { useState } from 'react'
import { getMondayOfWeek, parseISO, toISO } from '../utils/dates'

interface Props {
  onComplete: (startDateISO: string) => void
}

export default function Onboarding({ onComplete }: Props) {
  const [value, setValue] = useState('2026-03-31')

  function handleStart() {
    if (!value) return
    const mon = getMondayOfWeek(parseISO(value).toDate())
    onComplete(toISO(mon.toDate()))
  }

  return (
    <div className="onboarding">
      <h1>Pitcher Tracker</h1>
      <p>Set your program start date to begin tracking your training.</p>
      <div className="onboarding-inner">
        <label htmlFor="start-date">Program start date (Monday)</label>
        <input
          id="start-date"
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ width: '100%', marginBottom: 24 }}
        />
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleStart}>
          Get Started
        </button>
      </div>
    </div>
  )
}
