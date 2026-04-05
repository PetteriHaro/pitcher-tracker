import type { GymExercise } from "./types";

// Default exercise templates per gym day.
// IDs are stable — never change them. Names can be edited by the user.
export const GYM_EXERCISE_TEMPLATES: Record<string, GymExercise[]> = {
  Tue: [
    { id: "tue-1", name: "Pull ups 4x5" },
    { id: "tue-2", name: "Chest fly 4x8" },
    { id: "tue-3", name: "Lateral raise 4x10" },
    { id: "tue-4", name: "Rear delts 4x10" },
    { id: "tue-5", name: "SS Bicep curl 3x10" },
    { id: "tue-6", name: "SS Cable tricep 3x10" },
  ],
  Thu: [
    { id: "thu-1", name: "Squat 3x5" },
    { id: "thu-2", name: "Single Leg RDL 3x10" },
    { id: "thu-3", name: "Forearms 3x20 / 3x10" },
    { id: "thu-4", name: "SS Good girl 3x10" },
    { id: "thu-5", name: "SS Bad girl 3x10" },
    { id: "thu-6", name: "Abs 3x16" },
  ],
  Fri: [
    { id: "fri-1", name: "Assisted pull up 4x6" },
    { id: "fri-2", name: "Chest fly 4x8" },
    { id: "fri-3", name: "Lateral raise 4x10" },
    { id: "fri-4", name: "Rear delts 4x10" },
    { id: "fri-5", name: "SS Cable bicep 3x10" },
    { id: "fri-6", name: "SS Cable tricep 3x10" },
  ],
  Sat: [
    { id: "sat-1", name: "Reverse lunge 3x10" },
    { id: "sat-2", name: "Dips 3x6" },
    { id: "sat-3", name: "Face pull 3x10" },
    { id: "sat-4", name: "Leg curl 3x5" },
    { id: "sat-5", name: "Leg extension 3x5" },
    { id: "sat-6", name: "Abs 3x16" },
  ],
};
