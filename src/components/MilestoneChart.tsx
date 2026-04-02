interface ChartPoint {
  weekNumber: number
  value: number
  unit: string
}

interface Props {
  title: string
  points: ChartPoint[]
}

export default function MilestoneChart({ title, points }: Props) {
  if (points.length === 0) return null

  const max = Math.max(...points.map(p => p.value))

  return (
    <div className="milestone-chart">
      <div className="chart-title">{title}</div>
      <div className="chart-rows">
        {points.map((p, i) => (
          <div className="chart-row" key={i}>
            <div className="chart-lbl">Wk {p.weekNumber}</div>
            <div className="chart-bar-wrap">
              <div
                className="chart-bar"
                style={{ width: `${Math.round((p.value / Math.max(max, 1)) * 100)}%` }}
              >
                <span>{p.value}{p.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
