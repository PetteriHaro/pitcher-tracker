import { useState, useEffect } from "react";
import type { DayData, Day } from "./types";
import {
  loadStartDate,
  saveStartDate,
  loadData,
  saveData,
} from "./utils/storage";
import {
  getMondayOfWeek,
  weekNumberFor,
  isDeloadWeek,
  toISO,
  addDays,
  today,
  parseISO,
} from "./utils/dates";
import { initDay } from "./utils/initDay";
import { MOVEMENT_KEYS } from "./constants";
import Onboarding from "./components/Onboarding";
import WeekTab from "./components/WeekTab";
import AnalyticsTab from "./components/AnalyticsTab";
import SettingsModal from "./components/SettingsModal";

type Tab = "week" | "analytics";

function prePopulate(): DayData {
  const data: DayData = {};

  // Tuesday Apr 1
  const tue = initDay("2026-04-01");
  MOVEMENT_KEYS.forEach((k) => {
    tue.movement[k] = true;
  });
  tue.throwing = {
    type: "javelin_longtoss",
    javelinDone: false,
    workingThrows: 40,
    longTossMaxDistance: 50,
    postThrowRecovery: false,
  };
  tue.gym = true;
  data["2026-04-01"] = tue;

  // Wednesday Apr 2
  const wed = initDay("2026-04-02");
  MOVEMENT_KEYS.forEach((k) => {
    wed.movement[k] = true;
  });
  wed.throwing = {
    type: "mound_bullpen",
    workingThrows: 40,
    intensity: "60-70%",
    postThrowRecovery: false,
  };
  data["2026-04-02"] = wed;

  return data;
}

export default function App() {
  const [startDate, setStartDate] = useState<string | null>(loadStartDate);
  const [data, setData] = useState<DayData>(loadData);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (!startDate) return;
    const todayMon = getMondayOfWeek(today().toDate());
    const startMon = parseISO(startDate);
    const offset = Math.round(todayMon.diff(startMon, "days") / 7);
    setWeekOffset(offset);
  }, [startDate]);

  function handleSetStartDate(iso: string) {
    let d = loadData();

    if (iso === "2026-03-31" && Object.keys(d).length === 0) {
      d = prePopulate();
      saveData(d);
      setData(d);
    }

    saveStartDate(iso);
    setStartDate(iso);
  }

  function handleDataChange(iso: string, day: Day) {
    setData((prev) => {
      const next = { ...prev, [iso]: day };
      saveData(next);
      return next;
    });
  }

  function handleSaveSettings(newStartDate: string) {
    saveStartDate(newStartDate);
    setStartDate(newStartDate);
  }

  function handleImport() {
    setData(loadData());
    setStartDate(loadStartDate());
  }

  function handleReset() {
    setData({});
    setStartDate(null);
  }

  const todayISO = toISO(today().toDate());
  const currentWeekISO = startDate
    ? toISO(
        addDays(
          getMondayOfWeek(parseISO(startDate).toDate()),
          weekOffset * 7,
        ).toDate(),
      )
    : todayISO;
  const currentWeekNum = startDate
    ? weekNumberFor(currentWeekISO, startDate)
    : 1;
  const deload = isDeloadWeek(currentWeekNum);

  if (!startDate) {
    return <Onboarding onComplete={handleSetStartDate} />;
  }

  return (
    <>
      <div className="header">
        <div className="header-top">
          <span className="app-title">Pitcher Tracker</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {deload && <span className="deload-badge">Deload</span>}
            <button
              className="settings-btn"
              onClick={() => setSettingsModalOpen(true)}
            >
              ⚙️
            </button>
          </div>
        </div>
        <div className="tabs">
          {(["week", "analytics"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "week" ? "Week" : "Analytics"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "week" && (
        <WeekTab
          weekOffset={weekOffset}
          startDate={startDate}
          data={data}
          onDataChange={handleDataChange}
          onWeekChange={(delta) => setWeekOffset((o) => o + delta)}
        />
      )}
      {activeTab === "analytics" && (
        <AnalyticsTab data={data} startDate={startDate} />
      )}

      <SettingsModal
        isOpen={settingsModalOpen}
        startDate={startDate}
        onClose={() => setSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        onImport={handleImport}
        onReset={handleReset}
      />
    </>
  );
}
