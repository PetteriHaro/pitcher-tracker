export type ThrowType = 'javelin_longtoss' | 'mound_bullpen' | 'rest'
export type Intensity = '60-70%' | '70-80%' | '80-90%' | '90-100%'

export interface Movement {
  spine: boolean
  shoulders: boolean
  hips: boolean
  balance: boolean
  core: boolean
  inversions: boolean
  breathing: boolean
}

export interface Throwing {
  type: ThrowType
  javelinDone?: boolean
  workingThrows: number | ''
  longTossMaxDistance?: number | ''
  intensity?: Intensity
  postThrowRecovery: boolean
  notes: string
}

export interface Gym {
  done: boolean
  notes: string
}

export interface Day {
  date: string
  dayOfWeek: string
  movement: Movement
  throwing: Throwing | null
  gym: Gym | null
}

export interface Milestone {
  id: number
  date: string
  weekNumber: number
  longTossMax: number | null
  velocity: number | null
  wallSlideRange: string
  bridgeDepth: string
  pikeHold: number | null
  deepSquatComfortable: boolean
  ankleDorsiflexion: number | null
}

export type DayData = Record<string, Day>
