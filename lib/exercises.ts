import type { Exercise, MuscleGroup } from "./types"

export const DEFAULT_EXERCISES: Exercise[] = [
  // ── PECTORAUX ──────────────────────────────────────────────────────────────
  { id: "bench-press", name: "Développé couché", muscleGroup: "chest", type: "strength", compound: true },
  { id: "incline-bench", name: "Développé incliné", muscleGroup: "chest", type: "strength", compound: true },
  { id: "decline-bench", name: "Développé décliné", muscleGroup: "chest", type: "strength", compound: true },
  { id: "cable-fly", name: "Écartés poulie", muscleGroup: "chest", type: "strength", compound: false },
  { id: "dips", name: "Dips", muscleGroup: "chest", type: "bodyweight", compound: true },
  { id: "push-up", name: "Pompes", muscleGroup: "chest", type: "bodyweight", compound: true },
  // ── DOS ────────────────────────────────────────────────────────────────────
  { id: "deadlift", name: "Soulevé de terre", muscleGroup: "back", type: "strength", compound: true },
  { id: "pull-up", name: "Tractions", muscleGroup: "back", type: "bodyweight", compound: true },
  { id: "lat-pulldown", name: "Tirage vertical", muscleGroup: "back", type: "strength", compound: true },
  { id: "barbell-row", name: "Rowing barre", muscleGroup: "back", type: "strength", compound: true },
  { id: "cable-row", name: "Rowing poulie basse", muscleGroup: "back", type: "strength", compound: false },
  { id: "face-pull", name: "Face Pull", muscleGroup: "back", type: "strength", compound: false },
  { id: "shrug", name: "Haussements d'épaules", muscleGroup: "back", type: "strength", compound: false },
  // ── ÉPAULES ────────────────────────────────────────────────────────────────
  { id: "ohp", name: "Développé militaire", muscleGroup: "shoulders", type: "strength", compound: true },
  { id: "lateral-raise", name: "Élévations latérales", muscleGroup: "shoulders", type: "strength", compound: false },
  { id: "front-raise", name: "Élévations frontales", muscleGroup: "shoulders", type: "strength", compound: false },
  { id: "arnold-press", name: "Arnold Press", muscleGroup: "shoulders", type: "strength", compound: false },
  { id: "rear-delt-fly", name: "Écartés arrière", muscleGroup: "shoulders", type: "strength", compound: false },
  // ── BRAS ───────────────────────────────────────────────────────────────────
  { id: "bicep-curl", name: "Curl biceps", muscleGroup: "arms", type: "strength", compound: false },
  { id: "hammer-curl", name: "Curl marteau", muscleGroup: "arms", type: "strength", compound: false },
  { id: "preacher-curl", name: "Curl pupitre", muscleGroup: "arms", type: "strength", compound: false },
  { id: "tricep-pushdown", name: "Pushdown triceps", muscleGroup: "arms", type: "strength", compound: false },
  { id: "skull-crusher", name: "Skull Crusher", muscleGroup: "arms", type: "strength", compound: false },
  { id: "overhead-tricep", name: "Extension triceps overhead", muscleGroup: "arms", type: "strength", compound: false },
  { id: "chin-up", name: "Chin-Up", muscleGroup: "arms", type: "bodyweight", compound: true },
  // ── JAMBES ─────────────────────────────────────────────────────────────────
  { id: "squat", name: "Squat", muscleGroup: "legs", type: "strength", compound: true },
  { id: "front-squat", name: "Squat avant", muscleGroup: "legs", type: "strength", compound: true },
  { id: "leg-press", name: "Presse à cuisses", muscleGroup: "legs", type: "strength", compound: true },
  { id: "rdl", name: "Soulevé roumain", muscleGroup: "legs", type: "strength", compound: true },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "legs", type: "strength", compound: false },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs", type: "strength", compound: false },
  { id: "calf-raise", name: "Mollets debout", muscleGroup: "legs", type: "strength", compound: false },
  { id: "bulgarian-split", name: "Fentes bulgares", muscleGroup: "legs", type: "strength", compound: true },
  { id: "hip-thrust", name: "Hip Thrust", muscleGroup: "legs", type: "strength", compound: false },
  { id: "lunge", name: "Fentes marchées", muscleGroup: "legs", type: "strength", compound: true },
  // ── ABDOS ──────────────────────────────────────────────────────────────────
  { id: "plank", name: "Gainage", muscleGroup: "core", type: "bodyweight", compound: false },
  { id: "crunch", name: "Crunch", muscleGroup: "core", type: "bodyweight", compound: false },
  { id: "leg-raise", name: "Relevés de jambes", muscleGroup: "core", type: "bodyweight", compound: false },
  { id: "ab-wheel", name: "Roue abdominale", muscleGroup: "core", type: "bodyweight", compound: false },
  { id: "cable-crunch", name: "Crunch poulie", muscleGroup: "core", type: "strength", compound: false },
  { id: "russian-twist", name: "Russian Twist", muscleGroup: "core", type: "bodyweight", compound: false },
  // ── COURSE ─────────────────────────────────────────────────────────────────
  { id: "run-easy", name: "Footing facile", muscleGroup: "running", type: "cardio", compound: false },
  { id: "run-tempo", name: "Course tempo", muscleGroup: "running", type: "cardio", compound: false },
  { id: "run-intervals", name: "Fractionné", muscleGroup: "running", type: "cardio", compound: false },
  { id: "run-long", name: "Sortie longue", muscleGroup: "running", type: "cardio", compound: false },
  { id: "sprint", name: "Sprint", muscleGroup: "running", type: "cardio", compound: false },
  // ── VÉLO ───────────────────────────────────────────────────────────────────
  { id: "bike-road", name: "Vélo route", muscleGroup: "cycling", type: "cardio", compound: false },
  { id: "bike-spin", name: "Spinning / Home trainer", muscleGroup: "cycling", type: "cardio", compound: false },
  { id: "bike-hiit", name: "Vélo HIIT", muscleGroup: "cycling", type: "cardio", compound: false },
  { id: "bike-mountain", name: "VTT", muscleGroup: "cycling", type: "cardio", compound: false },
  // ── NATATION ───────────────────────────────────────────────────────────────
  { id: "swim-freestyle", name: "Crawl", muscleGroup: "swimming", type: "cardio", compound: false },
  { id: "swim-backstroke", name: "Dos crawlé", muscleGroup: "swimming", type: "cardio", compound: false },
  { id: "swim-breaststroke", name: "Brasse", muscleGroup: "swimming", type: "cardio", compound: false },
  { id: "swim-butterfly", name: "Papillon", muscleGroup: "swimming", type: "cardio", compound: false },
  { id: "swim-intervals", name: "Natation fractionnée", muscleGroup: "swimming", type: "cardio", compound: false },
  // ── AVIRON ─────────────────────────────────────────────────────────────────
  { id: "row-ergometer", name: "Ergomètre rameur", muscleGroup: "rowing", type: "cardio", compound: false },
  { id: "row-water", name: "Aviron sur eau", muscleGroup: "rowing", type: "cardio", compound: false },
  // ── COMBAT ─────────────────────────────────────────────────────────────────
  { id: "boxing", name: "Boxe", muscleGroup: "combat", type: "sport", compound: false },
  { id: "mma", name: "MMA", muscleGroup: "combat", type: "sport", compound: false },
  { id: "judo", name: "Judo", muscleGroup: "combat", type: "sport", compound: false },
  { id: "bjj", name: "BJJ", muscleGroup: "combat", type: "sport", compound: false },
  { id: "kickboxing", name: "Kickboxing", muscleGroup: "combat", type: "sport", compound: false },
  { id: "wrestling", name: "Lutte", muscleGroup: "combat", type: "sport", compound: false },
  // ── SPORT ──────────────────────────────────────────────────────────────────
  { id: "football", name: "Football", muscleGroup: "sport", type: "sport", compound: false },
  { id: "basketball", name: "Basketball", muscleGroup: "sport", type: "sport", compound: false },
  { id: "tennis", name: "Tennis", muscleGroup: "sport", type: "sport", compound: false },
  { id: "volleyball", name: "Volleyball", muscleGroup: "sport", type: "sport", compound: false },
  { id: "climbing", name: "Escalade", muscleGroup: "sport", type: "sport", compound: false },
  { id: "yoga", name: "Yoga", muscleGroup: "sport", type: "sport", compound: false },
]

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Pectoraux",
  back: "Dos",
  shoulders: "Épaules",
  arms: "Bras",
  legs: "Jambes",
  core: "Abdos",
  running: "Course",
  cycling: "Vélo",
  swimming: "Natation",
  rowing: "Aviron",
  combat: "Combat",
  sport: "Sport",
}

export const SPORT_TYPE_LABELS: Record<string, string> = {
  strength: "Force",
  cardio: "Cardio",
  bodyweight: "Poids de corps",
  sport: "Sport",
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "arms", "legs", "core",
  "running", "cycling", "swimming", "rowing", "combat", "sport",
]
