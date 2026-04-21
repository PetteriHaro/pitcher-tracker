import { useState, useEffect } from "react";
import { ActionIcon, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import type { DayData, Day, GymPlan, GymProgress, Schedule } from "./types";
import {
  loadAllUserData,
  saveStartDate,
  saveScheduleDay,
  saveDay,
  saveGymPlanDay,
  appendGymEntry,
  deleteGymEntry,
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
import { DEFAULT_SCHEDULE } from "./constants";
import LoginScreen from "./components/LoginScreen";
import Onboarding from "./components/Onboarding";
import WeekTab from "./components/WeekTab";
import GymTab from "./components/GymTab";
import SettingsModal from "./components/SettingsModal";

type Tab = "week" | "gym";
type AppState = "loading" | "unauthenticated" | "ready";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [data, setData] = useState<DayData>({});
  const [gymPlan, setGymPlan] = useState<GymPlan>({});
  const [gymProgress, setGymProgress] = useState<GymProgress>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  function hydrateState(snapshot: LocalSnapshot) {
    setStartDate(snapshot.startDate);
    setSchedule(snapshot.schedule);
    setData(snapshot.data);
    setGymPlan(snapshot.gymPlan);
    setGymProgress(snapshot.gymProgress);
  }

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    async function applySession(
      session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"],
    ) {
      if (cancelled) return;
      resolved = true;
      if (!session) {
        setAppState("unauthenticated");
        setUserId(null);
        setUserName("");
        setStartDate(null);
        setSchedule(DEFAULT_SCHEDULE);
        setData({});
        setGymPlan({});
        setGymProgress({});
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      setUserName((session.user.user_metadata?.name as string | undefined) ?? "");
      try {
        const snapshot = await Promise.race([
          loadAllUserData(uid),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("load-timeout")), 8000),
          ),
        ]);
        if (cancelled) return;
        hydrateState(snapshot);
      } catch (err) {
        console.error("loadAllUserData failed:", err);
      }
      if (!cancelled) setAppState("ready");
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { applySession(session); },
    );

    const fallback = setTimeout(() => {
      if (!resolved && !cancelled) {
        console.warn("auth resolution timed out, showing login");
        setAppState("unauthenticated");
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
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
    const prev = startDate;
    setStartDate(iso);
    saveStartDate(userId, iso).catch(() => setStartDate(prev));
  }

  function handleScheduleDayChange(
    dayName: string,
    cfg: { throwType: Schedule[string]["throwType"]; gym: boolean },
  ) {
    if (!userId) return;
    const prev = schedule[dayName];
    setSchedule((p) => ({ ...p, [dayName]: cfg }));
    saveScheduleDay(userId, dayName, cfg).catch(() => {
      setSchedule((p) => ({ ...p, [dayName]: prev }));
    });
  }

  function handleDataChange(iso: string, day: Day) {
    if (!userId) return;
    const prev = data[iso];
    setData((p) => ({ ...p, [iso]: day }));
    saveDay(userId, iso, day).catch(() => {
      setData((p) => {
        if (prev === undefined) {
          const next = { ...p };
          delete next[iso];
          return next;
        }
        return { ...p, [iso]: prev };
      });
    });
  }

  function handleGymPlanChange(dayName: string, exercises: GymPlan[string]) {
    if (!userId) return;
    const prev = gymPlan[dayName] ?? [];
    setGymPlan((p) => ({ ...p, [dayName]: exercises }));
    saveGymPlanDay(userId, dayName, exercises).catch(() => {
      setGymPlan((p) => ({ ...p, [dayName]: prev }));
    });
  }

  function handleGymEntryAppend(exerciseId: string, entry: GymProgress[string][number]) {
    if (!userId) return;
    setGymProgress((p) => ({
      ...p,
      [exerciseId]: [...(p[exerciseId] ?? []), entry],
    }));
    appendGymEntry(userId, exerciseId, entry).catch(() => {
      setGymProgress((p) => ({
        ...p,
        [exerciseId]: (p[exerciseId] ?? []).filter((e) => e.id !== entry.id),
      }));
    });
  }

  function handleGymEntryDelete(exerciseId: string, entryId: string) {
    if (!userId) return;
    const prev = gymProgress[exerciseId] ?? [];
    setGymProgress((p) => ({
      ...p,
      [exerciseId]: prev.filter((e) => e.id !== entryId),
    }));
    deleteGymEntry(userId, entryId).catch(() => {
      setGymProgress((p) => ({ ...p, [exerciseId]: prev }));
    });
  }

  function handleSaveSettings(newStartDate: string) {
    if (!userId) return;
    saveStartDate(userId, newStartDate);
    setStartDate(newStartDate);
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

  if (!startDate) {
    return (
      <Onboarding
        initialName={userName}
        schedule={schedule}
        onScheduleChange={handleScheduleDayChange}
        onComplete={handleSetStartDate}
      />
    );
  }

  const currentWeekISO = toISO(
    addDays(getMondayOfWeek(parseISO(startDate).toDate()), weekOffset * 7).toDate(),
  );
  const currentWeekNum = weekNumberFor(currentWeekISO, startDate);
  const deload = isDeloadWeek(currentWeekNum);

  return (
    <>
      <div className="header">
        <div className="header-top">
          <span className="app-title">Pitcher Tracker</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {deload && <span className="deload-badge">Deload</span>}
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setSettingsModalOpen(true)}
              aria-label="Open settings"
            >
              <IconSettings size={20} />
            </ActionIcon>
          </div>
        </div>
        <Tabs
          value={activeTab}
          onChange={(v) => v && setActiveTab(v as Tab)}
          color="accent"
        >
          <Tabs.List>
            <Tabs.Tab value="week">Week</Tabs.Tab>
            <Tabs.Tab value="gym">Gym</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      {activeTab === "week" && (
        <WeekTab
          weekOffset={weekOffset}
          startDate={startDate}
          data={data}
          schedule={schedule}
          onDataChange={handleDataChange}
          onWeekChange={(delta) => setWeekOffset((o) => o + delta)}
          onOpenGymTab={() => setActiveTab("gym")}
        />
      )}
      {activeTab === "gym" && (
        <GymTab
          gymPlan={gymPlan}
          gymProgress={gymProgress}
          schedule={schedule}
          onPlanChange={handleGymPlanChange}
          onEntryAppend={handleGymEntryAppend}
          onEntryDelete={handleGymEntryDelete}
        />
      )}

      <SettingsModal
        isOpen={settingsModalOpen}
        startDate={startDate}
        schedule={schedule}
        onClose={() => setSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        onScheduleChange={handleScheduleDayChange}
      />
    </>
  );
}
