import type { Milestone } from '../types'
import { parseISO, formatDate } from '../utils/dates'
import MilestoneChart from './MilestoneChart'

interface Props {
  milestones: Milestone[]
  onOpenModal: () => void
}

export default function MilestonesTab({ milestones, onOpenModal }: Props) {
  const ltPoints = milestones
    .filter(m => m.longTossMax !== null)
    .slice()
    .reverse()
    .map(m => ({ weekNumber: m.weekNumber, value: m.longTossMax!, unit: 'm' }))

  const veloPoints = milestones
    .filter(m => m.velocity !== null)
    .slice()
    .reverse()
    .map(m => ({ weekNumber: m.weekNumber, value: m.velocity!, unit: 'mph' }))

  return (
    <div className="tab-panel">
      <button className="add-milestone-btn" onClick={onOpenModal}>
        + Log Progress Milestone
      </button>

      <MilestoneChart title="Long Toss Max Distance (m)" points={ltPoints} />
      <MilestoneChart title="Velocity (mph)" points={veloPoints} />

      {milestones.length === 0 ? (
        <div className="empty-state">
          No milestones logged yet.<br />
          Tap the button above to log your first entry.
        </div>
      ) : (
        <div className="milestone-list">
          {milestones.map(m => {
            const rows: [string, string][] = []
            if (m.longTossMax) rows.push(['Long toss max', `${m.longTossMax}m`])
            if (m.velocity) rows.push(['Velocity', `${m.velocity} mph`])
            if (m.wallSlideRange) rows.push(['Wall slide', m.wallSlideRange])
            if (m.bridgeDepth) rows.push(['Bridge depth', m.bridgeDepth])
            if (m.pikeHold) rows.push(['Pike hold', `${m.pikeHold}s`])
            rows.push(['Deep squat', m.deepSquatComfortable ? '✓ Comfortable' : '✗ Not yet'])
            if (m.ankleDorsiflexion) rows.push(['Ankle DF', `${m.ankleDorsiflexion}cm`])

            return (
              <div className="milestone-card" key={m.id}>
                <div className="milestone-header">
                  <span className="milestone-wk">Week {m.weekNumber}</span>
                  <span className="milestone-date">{formatDate(parseISO(m.date))}</span>
                </div>
                <div className="milestone-fields">
                  {rows.map(([lbl, val]) => (
                    <div className="mfield-row" key={lbl}>
                      <span className="mfield-label">{lbl}</span>
                      <span className="mfield-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
