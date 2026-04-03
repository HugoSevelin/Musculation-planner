"use client"

import { useEffect, useState, useMemo } from "react"
import { storage } from "@/lib/storage"
import type { Session, Exercise } from "@/lib/types"
import { MUSCLE_GROUP_LABELS } from "@/lib/exercises"

const LIME = "#b8ff00"
const CYAN = "#00e5ff"
const BORDER = "rgba(255,255,255,0.07)"
const SURFACE = "#161616"

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}`
  return `${m}min`
}

interface ExerciseStat {
  exerciseId: string
  name: string
  muscleGroup: string
  sessions: number
  pr: { weight: number; reps: number } | null
  lastWeight: number | null
  lastReps: number | null
  totalSets: number
  totalVolume: number
}

export function StatsView() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    setSessions(storage.sessions.get())
    setExercises(storage.exercises.get())
  }, [])

  const totalSessions = sessions.length
  const totalVolume = useMemo(() =>
    sessions.reduce((acc, s) =>
      acc + s.exercises.reduce((a, ex) =>
        a + ex.sets.reduce((b, set) =>
          b + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0), 0),
    [sessions])
  const totalDuration = useMemo(() =>
    sessions.reduce((acc, s) =>
      acc + (s.finishedAt ? s.finishedAt - s.startedAt : 0), 0),
    [sessions])

  // Stats par exercice
  const exerciseStats = useMemo((): ExerciseStat[] => {
    const map = new Map<string, ExerciseStat>()

    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (ex.sets.length === 0) continue
        const exercise = exercises.find((e) => e.id === ex.exerciseId)
        if (!exercise) continue

        let stat = map.get(ex.exerciseId)
        if (!stat) {
          stat = {
            exerciseId: ex.exerciseId,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sessions: 0,
            pr: null,
            lastWeight: null,
            lastReps: null,
            totalSets: 0,
            totalVolume: 0,
          }
          map.set(ex.exerciseId, stat)
        }

        stat.sessions++
        stat.totalSets += ex.sets.length
        for (const set of ex.sets) {
          const vol = (set.weight ?? 0) * (set.reps ?? 0)
          stat.totalVolume += vol
          if (set.weight && set.reps) {
            const oneRM = set.weight * (1 + set.reps / 30)
            const prOneRM = stat.pr ? stat.pr.weight * (1 + stat.pr.reps / 30) : 0
            if (oneRM > prOneRM) {
              stat.pr = { weight: set.weight, reps: set.reps }
            }
          }
        }
      }
    }

    // Last session values (sessions sorted ascending)
    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime())
    for (const session of sortedSessions) {
      for (const ex of session.exercises) {
        const stat = map.get(ex.exerciseId)
        if (!stat) continue
        const setsWithWeight = ex.sets.filter((s) => s.weight && s.reps)
        if (setsWithWeight.length > 0) {
          const best = setsWithWeight.reduce((a, b) =>
            (b.weight ?? 0) > (a.weight ?? 0) ? b : a)
          stat.lastWeight = best.weight ?? null
          stat.lastReps = best.reps ?? null
        }
      }
    }

    return [...map.values()].sort((a, b) => b.totalVolume - a.totalVolume || b.sessions - a.sessions)
  }, [sessions, exercises])

  // Volume par groupe musculaire
  const volumeByMuscle = useMemo(() => {
    const map = new Map<string, number>()
    for (const stat of exerciseStats) {
      map.set(stat.muscleGroup, (map.get(stat.muscleGroup) ?? 0) + stat.totalVolume)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [exerciseStats])

  const maxMuscleVol = volumeByMuscle[0]?.[1] ?? 1

  if (totalSessions === 0) {
    return (
      <div className="flex flex-col px-4 pt-6">
        <div className="pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">Statistiques</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#efefef]">Performance</p>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-[#efefef]">Aucune donnée</p>
          <p className="text-xs text-[#444]">Complète une séance pour voir tes stats.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">Statistiques</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[#efefef]">Performance</p>
      </div>

      {/* Global stats */}
      <div className="mx-4 mt-4 grid grid-cols-3" style={{ border: `1px solid ${BORDER}` }}>
        <div className="px-4 py-4" style={{ borderRight: `1px solid ${BORDER}` }}>
          <p className="font-mono text-2xl font-black text-[#efefef]">{totalSessions}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#444]">Séances</p>
        </div>
        <div className="px-4 py-4" style={{ borderRight: `1px solid ${BORDER}` }}>
          <p className="font-mono text-2xl font-black text-[#efefef]">
            {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}t` : "—"}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#444]">Volume</p>
        </div>
        <div className="px-4 py-4">
          <p className="font-mono text-2xl font-black text-[#efefef]">
            {totalDuration > 0 ? formatDuration(totalDuration) : "—"}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#444]">Temps</p>
        </div>
      </div>

      {/* Volume par muscle */}
      {volumeByMuscle.length > 0 && (
        <div className="mx-4 mt-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LIME }}>
              Volume par groupe musculaire
            </p>
          </div>
          <div className="flex flex-col gap-2 px-4 pb-4">
            {volumeByMuscle.map(([group, vol]) => (
              <div key={group} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#555]">
                    {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS] ?? group}
                  </span>
                  <span className="font-mono text-[11px] text-[#444]">
                    {vol.toLocaleString("fr-FR")} kg
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(vol / maxMuscleVol) * 100}%`,
                      backgroundColor: LIME,
                      boxShadow: `0 0 6px ${LIME}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRs et perfs par exercice */}
      {exerciseStats.length > 0 && (
        <div className="mx-4 mt-4 mb-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CYAN }}>
              Records & performances
            </p>
          </div>

          {/* Column headers */}
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span className="flex-1 text-[9px] uppercase tracking-widest text-[#333]">Exercice</span>
            <span className="w-14 text-right text-[9px] uppercase tracking-widest text-[#333]">Séances</span>
            <span className="w-20 text-right text-[9px] uppercase tracking-widest text-[#333]">Dernier</span>
            <span className="w-16 text-right text-[9px] uppercase tracking-widest text-[#333]">PR</span>
          </div>

          {exerciseStats.map((stat, i) => {
            const isLast = i === exerciseStats.length - 1
            return (
              <div
                key={stat.exerciseId}
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: isLast ? "none" : `1px solid rgba(255,255,255,0.04)` }}
              >
                <span className="flex-1 text-sm text-[#efefef] truncate">{stat.name}</span>
                <span className="w-14 text-right font-mono text-xs text-[#444]">{stat.sessions}×</span>
                <span className="w-20 text-right font-mono text-xs text-[#efefef]">
                  {stat.lastWeight && stat.lastReps
                    ? `${stat.lastWeight}kg×${stat.lastReps}`
                    : "—"}
                </span>
                <span
                  className="w-16 text-right font-mono text-xs font-bold"
                  style={{ color: stat.pr ? LIME : "#444" }}
                >
                  {stat.pr ? `${stat.pr.weight}kg` : "—"}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
