import { useState, useEffect } from "react";
import type { DayData, Day, GymPlan, GymProgress } from "./types";
import {
  loadAllUserData,
  saveStartDate,
  saveDay,
  saveGymPlanDay,
  saveGymProgressExercise,
  saveAllUserData,
  clearAllUserData,
  type LocalSnapshot,
} from "./utils/storage";
import { supabase } from "./utils/supabase";
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
import LoginScreen from "./components/LoginScreen";
import Onboarding from "./components/Onboarding";
import WeekTab from "./components/WeekTab";
import AnalyticsTab from "./components/AnalyticsTab";
import GymTab from "./components/GymTab";
import SettingsModal from "./components/SettingsModal";

type Tab = "week" | "gym" | "analytics";
type AppState = "loading" | "unauthenticated" | "ready";

function prePopulate(): DayData {
  const data: DayData = {};

  const tue = initDay("2026-04-01");
  MOVEMENT_KEYS.forEach((k) => { tue.movement[k] = true; });
  tue.throwing = {
    type: "javelin_longtoss",
    javelinDone: false,
    workingThrows: 40,
    longTossMaxDistance: 50,
    postThrowRecovery: false,
  };
  tue.gym = true;
  data["2026-04-01"] = tue;

  const wed = initDay("2026-04-02");
  MOVEMENT_KEYS.forEach((k) => { wed.movement[k] = true; });
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
  const [appState, setAppState] = useState<AppState>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [data, setData] = useState<DayData>({});
  const [gymPlan, setGymPlan] = useState<GymPlan>({});
  const [gymProgress, setGymProgress] = useState<GymProgress>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  function hydrateState(snapshot: LocalSnapshot) {
    setStartDate(snapshot.startDate);
    setData(snapshot.data);
    setGymPlan(snapshot.gymPlan);
    setGymProgress(snapshot.gymProgress);
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setAppState("unauthenticated");
          setUserId(null);
          setStartDate(null);
          setData({});
          setGymPlan({});
          setGymProgress({});
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        const snapshot = await loadAllUserData(uid);
        hydrateState(snapshot);
        setAppState("ready");
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!startDate) return;
    const todayMon = getMondayOfWeek(today().toDate());
    const startMon = parseISO(startDate);
    const offset = Math.round(todayMon.diff(startMon, "days") / 7);
    setWeekOffset(offset);
  }, [startDate]);

  function handleSetStartDate(iso: string) {
    if (!userId) return;
    let d = data;
    if (iso === "2026-03-31" && Object.keys(d).length === 0) {
      d = prePopulate();
      setData(d);
      saveAllUserData(userId, { startDate: iso, data: d, gymPlan, gymProgress });
    } else {
      saveStartDate(userId, iso);
    }
    setStartDate(iso);
  }

  function handleDataChange(iso: string, day: Day) {
    if (!userId) return;
    setData((prev) => {
      const next = { ...prev, [iso]: day };
      saveDay(userId, iso, day);
      return next;
    });
  }

  function handleGymPlanChange(dayName: string, exercises: GymPlan[string]) {
    if (!userId) return;
    setGymPlan((prev) => {
      const next = { ...prev, [dayName]: exercises };
      saveGymPlanDay(userId, dayName, exercises);
      return next;
    });
  }

  function handleGymProgressChange(exerciseId: string, history: GymProgress[string]) {
    if (!userId) return;
    setGymProgress((prev) => {
      const next: GymProgress = { ...prev, [exerciseId]: history };
      saveGymProgressExercise(userId, exerciseId, history);
      return next;
    });
  }

  function handleSaveSettings(newStartDate: string) {
    if (!userId) return;
    saveStartDate(userId, newStartDate);
    setStartDate(newStartDate);
  }

  async function handleImport(snapshot: LocalSnapshot) {
    if (!userId) return;
    await saveAllUserData(userId, snapshot);
    hydrateState(snapshot);
  }

  async function handleReset() {
    if (!userId) return;
    await clearAllUserData(userId);
    setStartDate(null);
    setData({});
    setGymPlan({});
    setGymProgress({});
  }

  if (appState === "loading") {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (appState === "unauthenticated") {
    return <LoginScreen />;
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
  const currentWeekNum = startDate ? weekNumberFor(currentWeekISO, startDate) : 1;
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
            <button className="settings-btn" onClick={() => setSettingsModalOpen(true)}>
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
            Object.values(gymPlan).flat().map((ex) => [ex.id, ex.name]),
          )}
        />
      )}

      <SettingsModal
        isOpen={settingsModalOpen}
        startDate={startDate}
        data={data}
        onClose={() => setSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        onImport={handleImport}
        onReset={handleReset}
      />
    </>
  );
}
