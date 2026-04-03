import type { MovementKey } from "./constants";

interface Exercise {
  name: string;
  target: string;
  description: string;
}

export const MOVEMENT_EXERCISES: Record<MovementKey, Exercise[]> = {
  spine: [
    {
      name: "Cat-cow",
      target: "10 reps",
      description:
        "On hands and knees. Round spine up (cat), drop belly and lift chest (cow). One vertebra at a time.",
    },
    {
      name: "Open book rotations",
      target: "8/side",
      description:
        "Lie on side, knees stacked at 90°. Open top arm up and over, rotating upper back. Follow hand with eyes. Keep knees stacked.",
    },
    {
      name: "Prone cobra hold",
      target: "2 × 30s",
      description:
        "Face down, lift chest, arms out to sides, thumbs up. Squeeze between shoulder blades.",
    },
    {
      name: "Seated spinal twist",
      target: "30s/side",
      description:
        "One leg extended, cross other foot over. Twist toward bent knee using opposite elbow.",
    },
    {
      name: "Bridge",
      target: "3 × 20s",
      description:
        "Glute bridge. Progress toward full back bridge or wall walkdowns over weeks.",
    },
  ],
  shoulders: [
    {
      name: "Shoulder CARs",
      target: "5/arm",
      description:
        "Biggest, slowest arm circle possible. Note where you hit restriction.",
    },
    {
      name: "Prone shoulder ER stretch",
      target: "30s/side",
      description:
        "Face down, arm out at shoulder height, elbow 90°. Let forearm hang, rotate toward ceiling into external rotation. Hold end range.",
    },
    {
      name: "Overhead lat stretch",
      target: "40s/side",
      description:
        "Grab doorframe overhead, step away, sink hips to the side. Feel it from armpit down the torso.",
    },
    {
      name: "Doorframe pec stretch",
      target: "40s/side",
      description:
        "Forearm on doorframe at 120–135°, step through. Targets pec minor.",
    },
    {
      name: "Wall slides",
      target: "10 reps",
      description:
        "Back flat against wall, goalpost arms, slide up. Stop where contact breaks. Push end range over weeks.",
    },
    {
      name: "Sleeper stretch",
      target: "30s/side",
      description:
        "Lie on throwing side. Shoulder out at 90°, elbow bent so forearm points at ceiling. Gently push hand toward floor. Stretches internal rotation.",
    },
  ],
  hips: [
    {
      name: "Prone hip internal rotation",
      target: "30s/side",
      description:
        "Face down, bend one knee to 90°. Pull ankle toward ceiling by rotating thigh inward. Work at end range.",
    },
    {
      name: "Groin foam rolling",
      target: "60s/side",
      description:
        "Face down, inner thigh on roller. Roll slowly from knee toward groin. Extra time on tender spots. Focus right side.",
    },
    {
      name: "90/90 hold with forward lean",
      target: "30s/side",
      description:
        "Both knees at 90°, lean chest over front shin. Deep hip external rotation stretch.",
    },
    {
      name: "Cossack squat",
      target: "6/side",
      description:
        "Wide stance, sink into deep side lunge, other leg straight. Heel stays down. 3s down, 3s up.",
    },
    {
      name: "Half-kneeling hip flexor stretch",
      target: "40s/side",
      description:
        "Back knee down, squeeze glute, lean forward. Reach same-side arm overhead and lean away. Opens hip flexor, oblique, and lat.",
    },
    {
      name: "Deep squat hold",
      target: "60s",
      description:
        "Feet wider than shoulders, toes out, sink deep. Elbows push knees out. Heels on floor.",
    },
    {
      name: "Wall ankle dorsiflexion",
      target: "10/side",
      description:
        "Face wall, foot ~10cm away. Drive knee over toes to touch wall, heel stays down. Move foot further back as range improves.",
    },
  ],
  balance: [
    {
      name: "Single-leg stand, eyes closed",
      target: "45s/side",
      description: "Stand tall, one foot up, close eyes. Reset if you wobble.",
    },
    {
      name: "Single-leg hip hinge",
      target: "8/side",
      description:
        "Hinge forward on one leg, free leg extends behind. Touch floor, hold bottom 2s, return. Slow and controlled.",
    },
  ],
  core: [
    {
      name: "Dead bug",
      target: "8/side",
      description:
        "On back, arms toward ceiling, knees 90° over hips. Lower opposite arm and leg. Lower back stays pressed to floor. Breathe out as you extend.",
    },
    {
      name: "Rotational ground-up twist",
      target: "8/side",
      description:
        "Wide split stance. Rotate trunk explosively from back hip toward front leg, pivoting back foot. Sequence: feet → hips → trunk → arms.",
    },
  ],
  inversions: [
    {
      name: "Pike hold",
      target: "3 × 20–30s",
      description:
        "Hands on floor, feet on chair/bench, walk hands back so hips are as high as possible. As this gets comfortable, raise the surface height.",
    },
    {
      name: "Downward dog hold",
      target: "3 × 20s",
      description:
        "Hands and feet on floor, push hips up and back, press chest toward thighs. Press hands into floor and push shoulders open.",
    },
  ],
};
