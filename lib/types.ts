export type SportType = "strength" | "cardio" | "bodyweight" | "sport"

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "running"
  | "cycling"
  | "swimming"
  | "rowing"
  | "combat"
  | "sport"

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  type: SportType
  compound: boolean
}

export interface ProgramExercise {
  exerciseId: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number // secondes (cardio/sport)
  distance?: number // mètres (cardio)
  notes?: string
}

export interface ProgramDay {
  id: string
  name: string
  type: "rest" | "workout"
  exercises: ProgramExercise[]
}

export interface Program {
  id: string
  name: string
  days: ProgramDay[] // 7 jours (Lun → Dim)
  createdAt: number
  updatedAt: number
}

export interface WorkoutSet {
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  completed: boolean
}

export interface SessionExercise {
  exerciseId: string
  sets: WorkoutSet[]
}

export interface Session {
  id: string
  programId?: string
  dayId?: string
  date: string // ISO date
  startedAt: number
  finishedAt?: number
  exercises: SessionExercise[]
  notes?: string
}

export interface BodyMetric {
  date: string
  weight?: number
  bodyFat?: number
  chest?: number
  waist?: number
  arms?: number
}

export interface Settings {
  restTimerDefault: 60 | 90 | 120 | 180
  unit: "kg" | "lbs"
}
