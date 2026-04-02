import type { DayData } from '../types'
import { computeWeeklyStats, computeAllTimeStats, allLTSessions } from '../utils/analytics'
import { formatDate, parseISO } from '../utils/dates'

interface Props {
  data: DayData
  startDate: string
}

const INTENSITY_COLOR: Record<string, string> = {
  '60-70%': '#3dba6e',
  '70-80%': '#6c8aff',
  '80-90%': '#f0a930',
  '90-100%': '#e05555',
}

function pct(rate: number) {
  return `${Math.round(rate * 100)}%`
}

function BarChart({
  rows,
  maxVal,
  unit,
  colorFn,
}: {
  rows: { label: string; value: number; sub?: string }[]
  maxVal: number
  unit: string
  colorFn?: (label: string) => string
}) {
  if (rows.length === 0) return <p className="analytics-empty">No data yet</p>
  return (
    <div className="chart-rows">
      {rows.map((r, i) => (
        <div className="chart-row" key={i}>
          <div className="chart-lbl" title={r.sub}>{r.label}</div>
          <div className="chart-bar-wrap">
            <div
              className="chart-bar"
              style={{
                width: maxVal > 0 ? `${Math.max(4, Math.round((r.value / maxVal) * 100))}%` : '4%',
                background: colorFn ? colorFn(r.label) : undefined,
              }}
            >
              <span>{r.value}{unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsTab({ data, startDate }: Props) {
  const weekly = computeWeeklyStats(data, startDate)
  const allTime = computeAllTimeStats(weekly, data)
  const ltSessions = allLTSessions(weekly)

  const throwRows = weekly.map(w => ({
    label: `Wk ${w.weekNumber}`,
    value: w.totalThrows,
  }))
  const maxThrows = Math.max(...throwRows.map(r => r.value), 1)

  const ltRows = ltSessions.map(s => ({
    label: formatDate(parseISO(s.date)),
    value: s.maxDist,
    sub: `${s.throws} throws`,
  }))
  const maxLT = Math.max(...ltRows.map(r => r.value), 1)

  const moveRows = weekly.map(w => ({
    label: `Wk ${w.weekNumber}`,
    value: w.movementDays,
  }))

  // Intensity breakdown across all mound sessions
  const intensityCounts: Record<string, number> = {
    '60-70%': 0, '70-80%': 0, '80-90%': 0, '90-100%': 0,
  }
  weekly.forEach(w =>
    w.moundSessions.forEach(s => {
      intensityCounts[s.intensity] = (intensityCounts[s.intensity] ?? 0) + 1
    })
  )
  const totalMound = weekly.reduce((n, w) => n + w.moundSessions.length, 0)
  const intensityRows = Object.entries(intensityCounts)
    .filter(([, n]) => n > 0)
    .map(([label, value]) => ({ label, value }))
  const maxIntensity = Math.max(...intensityRows.map(r => r.value), 1)

  // Recovery per week
  const recoveryRows = weekly
    .filter(w => w.throwDays > 0)
    .map(w => ({
      label: `Wk ${w.weekNumber}`,
      value: w.throwDays > 0 ? Math.round((w.recoveryDone / w.throwDays) * 100) : 0,
    }))

  return (
    <div className="tab-panel">
      {/* All-time stat cards */}
      <div className="analytics-stat-grid">
        <div className="analytics-stat">
          <span className="val">{allTime.totalThrows.toLocaleString()}</span>
          <span className="lbl">Total Throws</span>
        </div>
        <div className="analytics-stat">
          <span className="val">{allTime.weeksActive}</span>
          <span className="lbl">Weeks Active</span>
        </div>
        <div className="analytics-stat">
          <span className="val">{allTime.bestLTDistance > 0 ? `${allTime.bestLTDistance}m` : '—'}</span>
          <span className="lbl">Best LT Distance</span>
        </div>
        <div className="analytics-stat">
          <span className="val">{allTime.totalSessions}</span>
          <span className="lbl">Sessions</span>
        </div>
        <div className="analytics-stat">
          <span className="val">{pct(allTime.movementRate)}</span>
          <span className="lbl">Movement Rate</span>
        </div>
        <div className="analytics-stat">
          <span className="val">{allTime.totalSessions > 0 ? pct(allTime.recoveryRate) : '—'}</span>
          <span className="lbl">Recovery Rate</span>
        </div>
      </div>

      {/* Throws per week */}
      <div className="analytics-card">
        <div className="analytics-card-title">Weekly Throw Volume</div>
        <BarChart rows={throwRows} maxVal={maxThrows} unit=" throws" />
      </div>

      {/* Long toss distance per session */}
      <div className="analytics-card">
        <div className="analytics-card-title">Long Toss Max Distance (per session)</div>
        <BarChart rows={ltRows} maxVal={maxLT} unit="m" />
      </div>

      {/* Movement consistency */}
      <div className="analytics-card">
        <div className="analytics-card-title">Movement Practice — Full Days per Week</div>
        <BarChart rows={moveRows} maxVal={7} unit="/7" />
      </div>

      {/* Recovery per week */}
      {recoveryRows.length > 0 && (
        <div className="analytics-card">
          <div className="analytics-card-title">Post-Throw Recovery Rate (% per week)</div>
          <BarChart rows={recoveryRows} maxVal={100} unit="%" />
        </div>
      )}

      {/* Intensity distribution */}
      {totalMound > 0 && (
        <div className="analytics-card">
          <div className="analytics-card-title">Mound Intensity Distribution ({totalMound} sessions)</div>
          <BarChart
            rows={intensityRows}
            maxVal={maxIntensity}
            unit=" sessions"
            colorFn={label => INTENSITY_COLOR[label] ?? 'var(--accent)'}
          />
        </div>
      )}
    </div>
  )
}
