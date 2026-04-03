import type { Program, Session, Exercise, BodyMetric, Settings } from "./types"
import { DEFAULT_EXERCISES } from "./exercises"

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  programs: {
    get: (): Program[] => getItem("programs", []),
    set: (programs: Program[]) => setItem("programs", programs),
  },
  sessions: {
    get: (): Session[] => getItem("sessions", []),
    set: (sessions: Session[]) => setItem("sessions", sessions),
  },
  exercises: {
    get: (): Exercise[] => {
      const stored = getItem<Exercise[]>("exercises", [])
      if (stored.length === 0) {
        setItem("exercises", DEFAULT_EXERCISES)
        return DEFAULT_EXERCISES
      }
      return stored
    },
    set: (exercises: Exercise[]) => setItem("exercises", exercises),
  },
  metrics: {
    get: (): BodyMetric[] => getItem("metrics", []),
    set: (metrics: BodyMetric[]) => setItem("metrics", metrics),
  },
  settings: {
    get: (): Settings =>
      getItem("settings", { restTimerDefault: 90, unit: "kg" }),
    set: (settings: Settings) => setItem("settings", settings),
  },
}
