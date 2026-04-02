import type { Day } from '../types'
import { MOVEMENT_KEYS } from '../constants'

interface Props {
  days: (Day | undefined)[]
}

export default function WeeklySummary({ days }: Props) {
  let totalThrows = 0
  let moveDays = 0
  let throwDays = 0
  let recoverDone = 0

  for (const day of days) {
    if (!day) continue
    const allMove = MOVEMENT_KEYS.every(k => day.movement[k])
    if (allMove) moveDays++
    if (day.throwing) {
      totalThrows += Number(day.throwing.workingThrows) || 0
      throwDays++
      if (day.throwing.postThrowRecovery) recoverDone++
    }
  }

  return (
    <div className="summary-card">
      <div className="summary-stat">
        <span className="val">{totalThrows}</span>
        <span className="lbl">Total Throws</span>
      </div>
      <div className="summary-stat">
        <span className="val">{moveDays}/7</span>
        <span className="lbl">Movement Rate</span>
      </div>
      <div className="summary-stat">
        <span className="val">{throwDays > 0 ? `${recoverDone}/${throwDays}` : '—'}</span>
        <span className="lbl">Recovery Rate</span>
      </div>
    </div>
  )
}
