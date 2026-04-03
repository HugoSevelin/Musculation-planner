"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { storage } from "@/lib/storage"
import type { ProgramDay, Exercise, Session, WorkoutSet } from "@/lib/types"

const LIME = "#b8ff00"
const CYAN = "#00e5ff"
const BORDER = "rgba(255,255,255,0.07)"
const SURFACE = "#161616"

interface LiveSet {
  reps: string
  weight: string
  completed: boolean
}

interface LiveExercise {
  exerciseId: string
  sets: LiveSet[]
}

interface WorkoutSessionProps {
  day: ProgramDay
  onFinish: () => void
  onCancel: () => void
  onGoToHistory?: () => void
}

export function WorkoutSession({ day, onFinish, onCancel, onGoToHistory }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [liveExercises, setLiveExercises] = useState<LiveExercise[]>([])
  const [startedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [doneSession, setDoneSession] = useState<Session | null>(null)

  useEffect(() => {
    const exLibrary = storage.exercises.get()
    setExercises(exLibrary)
    const live = day.exercises.map((planned) => {
      const ex = exLibrary.find((e) => e.id === planned.exerciseId)
      const isCardio = ex?.type === "cardio" || ex?.type === "sport"
      const setCount = planned.sets ?? (isCardio ? 1 : 3)
      return {
        exerciseId: planned.exerciseId,
        sets: Array.from({ length: setCount }, () => ({
          reps: planned.reps ? String(planned.reps) : "",
          weight: planned.weight ? String(planned.weight) : "",
          completed: false,
        })),
      }
    })
    setLiveExercises(live)
  }, [day])

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Date.now() - startedAt), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startedAt])

  function formatElapsed(ms: number) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
  }

  function toggleSet(exIdx: number, setIdx: number) {
    setLiveExercises((prev) =>
      prev.map((ex, i) => i !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, completed: !s.completed }),
      })
    )
  }

  function updateSet(exIdx: number, setIdx: number, field: "reps" | "weight", value: string) {
    setLiveExercises((prev) =>
      prev.map((ex, i) => i !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: value }),
      })
    )
  }

  function addSet(exIdx: number) {
    setLiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? "", weight: last?.weight ?? "", completed: false }] }
      })
    )
  }

  function finishSession() {
    const sessions = storage.sessions.get()
    const now = Date.now()
    const savedSession: Session = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString().split("T")[0],
      startedAt,
      finishedAt: now,
      exercises: liveExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.filter((s) => s.completed).map((s): WorkoutSet => ({
          reps: s.reps ? Number(s.reps) : undefined,
          weight: s.weight ? Number(s.weight) : undefined,
          completed: true,
        })),
      })),
    }
    storage.sessions.set([...sessions, savedSession])
    setDoneSession(savedSession)
  }

  const allSets = liveExercises.flatMap((ex) => ex.sets)
  const completedSets = allSets.filter((s) => s.completed).length
  const totalSets = allSets.length
  const progress = totalSets > 0 ? completedSets / totalSets : 0

  if (doneSession) {
    const durationMs = (doneSession.finishedAt ?? Date.now()) - doneSession.startedAt
    const totalSetsCompleted = doneSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    const totalVolume = doneSession.exercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) =>
        s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d0d] px-6">
        {/* Titre */}
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#444]">Séance terminée</p>
        <p className="mt-2 text-5xl font-black tracking-tight" style={{ color: LIME }}>
          {formatElapsed(durationMs)}
        </p>
        <p className="mt-1 font-mono text-xs text-[#555]">durée totale</p>

        {/* Stats */}
        <div className="mt-8 w-full" style={{ border: `1px solid ${BORDER}` }}>
          <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="px-5 py-4" style={{ borderRight: `1px solid ${BORDER}` }}>
              <p className="font-mono text-2xl font-black text-[#efefef]">{totalSetsCompleted}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#444]">Séries</p>
            </div>
            <div className="px-5 py-4">
              <p className="font-mono text-2xl font-black text-[#efefef]">
                {totalVolume > 0 ? `${totalVolume.toLocaleString("fr-FR")}` : "—"}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#444]">
                {totalVolume > 0 ? "kg total" : "Cardio / BW"}
              </p>
            </div>
          </div>

          {/* Récap par exercice */}
          {doneSession.exercises.filter((ex) => ex.sets.length > 0).map((ex, i) => {
            const exercise = exercises.find((e) => e.id === ex.exerciseId)
            const isLast = i === doneSession.exercises.filter((e) => e.sets.length > 0).length - 1
            const maxWeight = Math.max(...ex.sets.map((s) => s.weight ?? 0))
            const totalReps = ex.sets.reduce((acc, s) => acc + (s.reps ?? 0), 0)
            return (
              <div
                key={ex.exerciseId}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: isLast ? "none" : `1px solid rgba(255,255,255,0.04)` }}
              >
                <span className="text-sm text-[#efefef]">{exercise?.name ?? "?"}</span>
                <span className="font-mono text-xs" style={{ color: LIME }}>
                  {ex.sets.length} série{ex.sets.length > 1 ? "s" : ""}
                  {maxWeight > 0 ? ` · ${maxWeight}kg` : ""}
                  {totalReps > 0 && maxWeight === 0 ? ` · ${totalReps} reps` : ""}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bouton retour */}
        <button
          onClick={onFinish}
          className="mt-6 flex w-full items-center justify-center py-4 text-sm font-black uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ backgroundColor: LIME, color: "#0d0d0d" }}
        >
          Retour à l&apos;accueil
        </button>
        {onGoToHistory && (
          <button
            onClick={() => { onFinish(); onGoToHistory() }}
            className="mt-3 text-[11px] uppercase tracking-widest text-[#444] hover:text-[#efefef] transition-colors"
          >
            Voir l&apos;historique →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={onCancel} className="text-[#444] hover:text-[#efefef] transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="currentColor" />
        </button>
        <div className="flex-1">
          <p className="text-base font-bold text-[#efefef]">{day.name}</p>
          <p className="font-mono text-[10px] text-[#444]">
            {completedSets}/{totalSets} séries complétées
          </p>
        </div>
        {/* Timer */}
        <span
          className="font-mono text-xl font-black"
          style={{
            color: LIME,
            textShadow: elapsed > 0 ? `0 0 16px rgba(184,255,0,0.5)` : "none",
          }}
        >
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, backgroundColor: LIME, boxShadow: `0 0 8px ${LIME}` }}
        />
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto pb-28">
        {liveExercises.map((liveEx, exIdx) => {
          const exercise = exercises.find((e) => e.id === liveEx.exerciseId)
          if (!exercise) return null
          const allDone = liveEx.sets.every((s) => s.completed)
          const doneSets = liveEx.sets.filter((s) => s.completed).length
          const isCardio = exercise.type === "cardio" || exercise.type === "sport"

          return (
            <div
              key={exIdx}
              className="mt-3 mx-3"
              style={{ border: `1px solid ${allDone ? "rgba(184,255,0,0.25)" : BORDER}`, backgroundColor: SURFACE }}
            >
              {/* Exercise header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: allDone ? "rgba(184,255,0,0.07)" : "transparent" }}
              >
                <div>
                  <p className="text-sm font-bold text-[#efefef]">{exercise.name}</p>
                  <p className="font-mono text-[10px] text-[#444]">{doneSets}/{liveEx.sets.length} séries</p>
                </div>
                {allDone && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ backgroundColor: LIME, color: "#0d0d0d" }}
                  >
                    ✓ OK
                  </span>
                )}
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="w-7 text-center font-mono text-[9px] uppercase tracking-widest text-[#333]">#</span>
                {!isCardio && <span className="w-16 text-center font-mono text-[9px] uppercase tracking-widest text-[#333]">Reps</span>}
                {exercise.type === "strength" && <span className="w-16 text-center font-mono text-[9px] uppercase tracking-widest text-[#333]">kg</span>}
                {isCardio && <span className="w-16 text-center font-mono text-[9px] uppercase tracking-widest text-[#333]">min</span>}
                <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-[#333]">Fait</span>
              </div>

              {/* Sets */}
              {liveEx.sets.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    backgroundColor: set.completed ? "rgba(184,255,0,0.04)" : "transparent",
                    borderTop: setIdx > 0 ? `1px solid rgba(255,255,255,0.04)` : "none",
                  }}
                >
                  <span className="w-7 text-center font-mono text-xs text-[#444]">{setIdx + 1}</span>

                  {!isCardio && (
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                      placeholder="—"
                      inputMode="numeric"
                      className="w-16 border-b bg-transparent text-center font-mono text-base text-[#efefef] focus:outline-none"
                      style={{ borderColor: set.completed ? "rgba(184,255,0,0.3)" : "rgba(255,255,255,0.12)" }}
                    />
                  )}
                  {exercise.type === "strength" && (
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                      placeholder="—"
                      step={2.5}
                      inputMode="decimal"
                      className="w-16 border-b bg-transparent text-center font-mono text-base text-[#efefef] focus:outline-none"
                      style={{ borderColor: set.completed ? "rgba(184,255,0,0.3)" : "rgba(255,255,255,0.12)" }}
                    />
                  )}
                  {isCardio && (
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                      placeholder="—"
                      inputMode="numeric"
                      className="w-16 border-b bg-transparent text-center font-mono text-base text-[#efefef] focus:outline-none"
                      style={{ borderColor: set.completed ? "rgba(184,255,0,0.3)" : "rgba(255,255,255,0.12)" }}
                    />
                  )}

                  {/* Checkbox — big tap target */}
                  <button
                    onClick={() => toggleSet(exIdx, setIdx)}
                    className="ml-auto flex items-center justify-center transition-all"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: set.completed ? LIME : "transparent",
                      border: `2px solid ${set.completed ? LIME : "rgba(255,255,255,0.15)"}`,
                      boxShadow: set.completed ? `0 0 12px rgba(184,255,0,0.4)` : "none",
                    }}
                  >
                    {set.completed && <HugeiconsIcon icon={Tick01Icon} size={20} color="#0d0d0d" />}
                  </button>
                </div>
              ))}

              {/* Add set */}
              <button
                onClick={() => addSet(exIdx)}
                className="flex w-full items-center justify-center py-3 text-[10px] uppercase tracking-widest text-[#333] transition-colors hover:text-[#efefef]"
                style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}
              >
                + Ajouter une série
              </button>
            </div>
          )
        })}
      </div>

      {/* Finish button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ backgroundColor: "#0d0d0d", borderTop: `1px solid ${BORDER}` }}
      >
        <button
          onClick={finishSession}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            backgroundColor: completedSets > 0 ? LIME : "#1a1a1a",
            color: completedSets > 0 ? "#0d0d0d" : "#444",
            boxShadow: completedSets > 0 ? `0 0 20px rgba(184,255,0,0.3)` : "none",
          }}
        >
          <span>Finir la séance</span>
          <span className="font-mono text-sm">{formatElapsed(elapsed)}</span>
        </button>
      </div>
    </div>
  )
}
