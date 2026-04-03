// Default exercise templates per gym day.
// These are used to initialize a new day's exercise list on first open.
export const GYM_EXERCISE_TEMPLATES: Record<string, string[]> = {
  Tue: [
    "Pull ups 4x5",
    "Chest fly 4x8",
    "Lateral raise 4x10",
    "Rear delts 4x10",
    "SS Bicep curl 3x10",
    "SS Cable tricep 3x10",
  ],
  Thu: [
    "Squat 3x5",
    "Single Leg RDL 3x10",
    "Forearms 3x20 / 3x10",
    "SS Good girl 3x10",
    "SS Bad girl 3x10",
    "Abs 3x16",
  ],
  Fri: [
    "Assisted pull up 4x6",
    "Chest fly 4x8",
    "Lateral raise 4x10",
    "Rear delts 4x10",
    "SS Cable bicep 3x10",
    "SS Cable tricep 3x10",
  ],
  Sat: [
    "Reverse lunge 3x10",
    "Dips 3x6",
    "Face pull 3x10",
    "Leg curl 3x5",
    "Leg extension 3x5",
    "Abs 3x16",
  ],
};
