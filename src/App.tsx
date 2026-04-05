import { useState, useEffect } from "react";
import type { DayData, Day, GymPlan, GymProgress } from "./types";
import {
  loadStartDate,
  saveStartDate,
  loadData,
  saveData,
  loadGymPlan,
  saveGymPlan,
  loadGymProgress,
  saveGymProgress,
  runGymMigrationV1,
} from "./utils/storage";

// Run once before any state is initialised
runGymMigrationV1();
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
import GymTab from "./components/GymTab";
import SettingsModal from "./components/SettingsModal";

type Tab = "week" | "gym" | "analytics";

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
  const [gymPlan, setGymPlan] = useState<GymPlan>(loadGymPlan);
  const [gymProgress, setGymProgress] = useState<GymProgress>(loadGymProgress);
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

  function handleGymPlanChange(dayName: string, exercises: GymPlan[string]) {
    setGymPlan((prev) => {
      const next = { ...prev, [dayName]: exercises };
      saveGymPlan(next);
      return next;
    });
  }

  function handleGymProgressChange(exerciseId: string, history: GymProgress[string]) {
    setGymProgress((prev) => {
      const next: GymProgress = { ...prev, [exerciseId]: history };
      saveGymProgress(next);
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
          {(["week", "gym", "analytics"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "week" ? "Week" : tab === "gym" ? "Gym" : "Analytics"}
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
          onOpenGymTab={() => setActiveTab("gym")}
        />
      )}
      {activeTab === "gym" && (
        <GymTab
          gymPlan={gymPlan}
          gymProgress={gymProgress}
          onPlanChange={handleGymPlanChange}
          onProgressChange={handleGymProgressChange}
        />
      )}
      {activeTab === "analytics" && (
        <AnalyticsTab
          data={data}
          startDate={startDate}
          gymProgress={gymProgress}
          gymExerciseNames={Object.fromEntries(
            Object.values(gymPlan).flat().map((ex) => [ex.id, ex.name])
          )}
        />
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
