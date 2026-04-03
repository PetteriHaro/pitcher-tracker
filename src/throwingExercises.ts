export interface Exercise {
  name: string;
  target: string;
  description: string;
}

export const JAVELIN_PROGRAM: Exercise[] = [
  {
    name: "Standing throws",
    target: "10 reps",
    description:
      "Sideways to target, step and throw. Full body, ground up. Zero arm effort. If javelin wobbles, sequencing was wrong.",
  },
  {
    name: "Walk-in throws",
    target: "10 reps",
    description:
      "Three-step approach. Should feel effortless if sequencing is right.",
  },
  {
    name: "Full run-up throws",
    target: "5–10 reps",
    description:
      "Full approach, max distance. Everything from the ground up has to work in sequence.",
  },
];

export const POST_THROW_RECOVERY: Exercise[] = [
  {
    name: "Cool-down lob throws",
    target: "10–15 throws",
    description:
      "Easy throws at 30–40 ft, getting progressively lighter.",
  },
  {
    name: "Reverse throws",
    target: "10 throws",
    description:
      "Face away from target, throw light ball backwards over head. Activates decelerators.",
  },
  {
    name: "Foam roller lat",
    target: "60s",
    description:
      "Lie on side, roller under armpit/lat. Roll slowly from armpit to mid-ribcage.",
  },
  {
    name: "Lacrosse ball posterior shoulder",
    target: "60–90s",
    description:
      "Ball against wall behind shoulder (behind armpit area). Lean in, find tender spots, hold.",
  },
  {
    name: "Lacrosse ball pec minor",
    target: "60s",
    description:
      "Ball against wall just below collarbone near front of shoulder. Lean in, move slowly.",
  },
  {
    name: "Forearm flexor work",
    target: "60s",
    description:
      "Lacrosse ball on table or opposite thumb along inside of forearm, elbow to wrist.",
  },
  {
    name: "Sleeper stretch",
    target: "30s / side",
    description:
      "Lie on throwing side, shoulder at 90° in front, elbow bent 90°. Push hand toward floor.",
  },
  {
    name: "Cross-body stretch",
    target: "30s / side",
    description: "Pull throwing arm across chest with opposite hand.",
  },
  {
    name: "Wrist flexor stretch",
    target: "30s",
    description:
      "Arm extended, palm facing away, fingers up. Pull fingers back toward you.",
  },
  {
    name: "Wrist extensor stretch",
    target: "30s",
    description:
      "Arm extended, palm down. Press back of hand down with other hand.",
  },
];
