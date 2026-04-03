import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { DayData, GymProgress } from "../types";
import {
  computeWeeklyStats,
  computeAllTimeStats,
  allLTSessions,
} from "../utils/analytics";
import { formatDate, parseISO } from "../utils/dates";

interface Props {
  data: DayData;
  startDate: string;
  gymProgress: GymProgress;
}

const C = {
  accent: "#6c8aff",
  green: "#3dba6e",
  amber: "#f0a930",
  red: "#e05555",
  text2: "#9090a8",
  border: "#2e2e3a",
  bg3: "#24242d",
};

const INTENSITY_COLORS: Record<string, string> = {
  "60-70%": C.green,
  "70-80%": C.accent,
  "80-90%": C.amber,
  "90-100%": C.red,
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-title">{title}</div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <p className="analytics-empty">No data yet</p>;
}

const tooltipStyle = {
  contentStyle: {
    background: "#1a1a20",
    border: "1px solid #2e2e3a",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#e8e8f0" },
  itemStyle: { color: "#9090a8" },
};

const axisProps = {
  stroke: C.text2,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};


export default function AnalyticsTab({ data, startDate, gymProgress }: Props) {
  const weekly = computeWeeklyStats(data, startDate);
  const allTime = computeAllTimeStats(weekly, data);
  const ltSessions = allLTSessions(weekly);

  // Weekly throws bar data
  const throwData = weekly.map((w) => ({
    week: `W${w.weekNumber}`,
    throws: w.totalThrows,
  }));

  // Long toss distance — one point per session
  const ltData = ltSessions.map((s) => ({
    date: formatDate(parseISO(s.date)),
    dist: s.maxDist,
    throws: s.throws,
  }));

  // Movement days per week
  const moveData = weekly.map((w) => ({
    week: `W${w.weekNumber}`,
    days: w.movementDays,
    pct: Math.round((w.movementDays / 7) * 100),
  }));

  // Recovery rate per week (only weeks with throw sessions)
  const recoveryData = weekly
    .filter((w) => w.throwDays > 0)
    .map((w) => ({
      week: `W${w.weekNumber}`,
      rate: Math.round((w.recoveryDone / w.throwDays) * 100),
    }));

  // Intensity pie data
  const intensityMap: Record<string, number> = {};
  weekly.forEach((w) =>
    w.moundSessions.forEach((s) => {
      intensityMap[s.intensity] = (intensityMap[s.intensity] ?? 0) + 1;
    }),
  );
  const intensityData = Object.entries(intensityMap).map(([name, value]) => ({
    name,
    value,
  }));

  function pct(rate: number) {
    return `${Math.round(rate * 100)}%`;
  }

  return (
    <div className="tab-panel">
      {/* All-time stats */}
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
          <span className="val">
            {allTime.bestLTDistance > 0 ? `${allTime.bestLTDistance}m` : "—"}
          </span>
          <span className="lbl">Best LT Dist</span>
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
          <span className="val">
            {allTime.totalSessions > 0 ? pct(allTime.recoveryRate) : "—"}
          </span>
          <span className="lbl">Recovery Rate</span>
        </div>
      </div>

      {/* Weekly throw volume */}
      <Section title="Weekly Throw Volume">
        {throwData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={throwData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                vertical={false}
              />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: unknown) => [`${v} throws`, "Volume"]}
              />
              <Bar
                dataKey="throws"
                fill={C.accent}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Long toss distance trend */}
      <Section title="Long Toss Max Distance — per Session">
        {ltData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={ltData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} unit="m" domain={["auto", "auto"]} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: unknown) => [`${v}m`, "Max distance"]}
              />
              <Line
                type="monotone"
                dataKey="dist"
                stroke={C.green}
                strokeWidth={2}
                dot={{ fill: C.green, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Movement consistency */}
      <Section title="Movement Practice — Full Days per Week">
        {moveData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={moveData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                vertical={false}
              />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 7]} ticks={[0, 2, 4, 6, 7]} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: unknown) => [`${v}/7 days`, "Full movement"]}
              />
              <ReferenceLine
                y={7}
                stroke={C.green}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Bar dataKey="days" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {moveData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.days === 7 ? C.green : d.days >= 5 ? C.accent : C.amber
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Recovery rate */}
      {recoveryData.length > 0 && (
        <Section title="Post-Throw Recovery Rate per Week">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={recoveryData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} unit="%" domain={[0, 100]} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: unknown) => [`${v}%`, "Recovery"]}
              />
              <ReferenceLine
                y={100}
                stroke={C.green}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={C.amber}
                strokeWidth={2}
                dot={{ fill: C.amber, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* Gym — current weights */}
      {(() => {
        const exercises = Object.entries(gymProgress).filter(([, h]) => h.length > 0);
        if (exercises.length === 0) return null;
        return (
          <Section title="Gym — Current Weights">
            {exercises.map(([name, history]) => {
              const latest = history[history.length - 1];
              const prev = history.length > 1 ? history[history.length - 2] : null;
              const kgNow = latest.kg;
              const kgPrev = prev?.kg;
              const delta = latest.delta !== undefined
                ? `${latest.sign}${latest.delta}`
                : null;
              return (
                <div key={name} className="gym-analytics-row">
                  <span className="gym-analytics-name">{name}</span>
                  <span className="gym-analytics-right">
                    {kgNow !== undefined && (
                      <span className="gym-analytics-kg">{kgNow}kg</span>
                    )}
                    {delta && (
                      <span className="gym-analytics-delta">{delta}</span>
                    )}
                    {kgNow !== undefined && kgPrev !== undefined && kgNow !== kgPrev && (
                      <span className={kgNow > kgPrev ? "gym-analytics-trend up" : "gym-analytics-trend down"}>
                        {kgNow > kgPrev ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </Section>
        );
      })()}

      {/* Gym — kg progression per exercise */}
      {(() => {
        const exercises = Object.entries(gymProgress).filter(
          ([, h]) => h.filter((e) => e.kg !== undefined).length >= 2,
        );
        if (exercises.length === 0) return null;
        return (
          <Section title="Gym — Weight Progression">
            {exercises.map(([name, history]) => {
              const kgPoints = history
                .filter((e) => e.kg !== undefined)
                .map((e, i) => ({ i: i + 1, kg: e.kg as number }));
              const min = Math.min(...kgPoints.map((p) => p.kg));
              const max = Math.max(...kgPoints.map((p) => p.kg));
              return (
                <div key={name} style={{ marginBottom: 16 }}>
                  <div className="gym-analytics-chart-label">{name}</div>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={kgPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="i" {...axisProps} hide />
                      <YAxis {...axisProps} unit="kg" domain={[min - 2.5, max + 2.5]} />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v: unknown) => [`${v}kg`, name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="kg"
                        stroke={C.amber}
                        strokeWidth={2}
                        dot={{ fill: C.amber, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </Section>
        );
      })()}

      {/* Intensity distribution */}
      {intensityData.length > 0 && (
        <Section title="Mound Intensity Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={intensityData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`
                }
                labelLine={{ stroke: C.text2 }}
                fontSize={11}
              >
                {intensityData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={INTENSITY_COLORS[entry.name] ?? C.accent}
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(v: unknown) => [`${v} sessions`, ""]}
              />
              <Legend
                formatter={(value: string) => (
                  <span style={{ color: C.text2, fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      )}
    </div>
  );
}
