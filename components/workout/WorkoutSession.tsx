"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { storage } from "@/lib/storage"
import type { ProgramDay, Exercise, Session, WorkoutSet } from "@/lib/types"

const LIME = "#b8ff00"

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
}

export function WorkoutSession({ day, onFinish, onCancel }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [liveExercises, setLiveExercises] = useState<LiveExercise[]>([])
  const [startedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const exLibrary = storage.exercises.get()
    setExercises(exLibrary)

    // Pre-populate from planned day
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

  // Elapsed timer
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
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIdx ? s : { ...s, completed: !s.completed }
              ),
            }
      )
    )
  }

  function updateSet(exIdx: number, setIdx: number, field: "reps" | "weight", value: string) {
    setLiveExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIdx ? s : { ...s, [field]: value }
              ),
            }
      )
    )
  }

  function addSet(exIdx: number) {
    setLiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { reps: last?.reps ?? "", weight: last?.weight ?? "", completed: false }],
        }
      })
    )
  }

  function finishSession() {
    const sessions = storage.sessions.get()
    const session: Session = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString().split("T")[0],
      startedAt,
      finishedAt: Date.now(),
      exercises: liveExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets
          .filter((s) => s.completed)
          .map((s): WorkoutSet => ({
            reps: s.reps ? Number(s.reps) : undefined,
            weight: s.weight ? Number(s.weight) : undefined,
            completed: true,
          })),
      })),
    }
    storage.sessions.set([...sessions, session])
    onFinish()
  }

  const completedSets = liveExercises.flatMap((ex) => ex.sets).filter((s) => s.completed).length
  const totalSets = liveExercises.flatMap((ex) => ex.sets).length

  return (
    <div className="flex min-h-svh flex-col bg-[#f8f8f6]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4">
        <button onClick={onCancel} className="text-[#bbb] hover:text-[#111] transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#111]">{day.name}</p>
          <p className="font-mono text-[10px] text-[#999]">{completedSets}/{totalSets} séries</p>
        </div>
        {/* Elapsed timer */}
        <span className="font-mono text-lg font-bold" style={{ color: elapsed > 0 ? LIME : "#bbb", textShadow: elapsed > 0 ? `0 0 12px ${LIME}` : "none" }}>
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-black/5">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`, backgroundColor: LIME }}
        />
      </div>

      {/* Exercises */}
      <div className="flex-1 overflow-y-auto pb-32">
        {liveExercises.map((liveEx, exIdx) => {
          const exercise = exercises.find((e) => e.id === liveEx.exerciseId)
          if (!exercise) return null
          const allDone = liveEx.sets.every((s) => s.completed)
          const isCardio = exercise.type === "cardio" || exercise.type === "sport"

          return (
            <div key={exIdx} className="border-b border-black/10">
              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: allDone ? `${LIME}18` : "transparent" }}>
                <p className="text-sm font-medium" style={{ color: allDone ? "#111" : "#111" }}>
                  {exercise.name}
                </p>
                {allDone && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5" style={{ backgroundColor: LIME, color: "#111" }}>
                    OK
                  </span>
                )}
              </div>

              {/* Sets */}
              <div className="px-4 pb-3">
                {/* Column headers */}
                <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#bbb]">
                  <span className="w-8 text-center">#</span>
                  {!isCardio && <span className="w-16 text-center">Reps</span>}
                  {exercise.type === "strength" && <span className="w-16 text-center">kg</span>}
                  {isCardio && <span className="w-16 text-center">min</span>}
                  <span className="ml-auto">✓</span>
                </div>

                {liveEx.sets.map((set, setIdx) => (
                  <div key={setIdx} className="mb-2 flex items-center gap-3">
                    <span className="w-8 text-center font-mono text-xs text-[#bbb]">{setIdx + 1}</span>

                    {!isCardio && (
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        placeholder="—"
                        className="w-16 border-b border-black/10 bg-transparent text-center font-mono text-sm text-[#111] focus:border-[#111] focus:outline-none"
                      />
                    )}
                    {exercise.type === "strength" && (
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                        placeholder="—"
                        step={2.5}
                        className="w-16 border-b border-black/10 bg-transparent text-center font-mono text-sm text-[#111] focus:border-[#111] focus:outline-none"
                      />
                    )}
                    {isCardio && (
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        placeholder="—"
                        className="w-16 border-b border-black/10 bg-transparent text-center font-mono text-sm text-[#111] focus:border-[#111] focus:outline-none"
                      />
                    )}

                    <button
                      onClick={() => toggleSet(exIdx, setIdx)}
                      className="ml-auto flex h-8 w-8 items-center justify-center border transition-all"
                      style={{
                        backgroundColor: set.completed ? LIME : "transparent",
                        borderColor: set.completed ? LIME : "rgba(0,0,0,0.15)",
                      }}
                    >
                      {set.completed && <HugeiconsIcon icon={Tick01Icon} size={14} color="#111" />}
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSet(exIdx)}
                  className="mt-1 text-[10px] uppercase tracking-widest text-[#bbb] hover:text-[#111] transition-colors"
                >
                  + Série
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Finish button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-black/10 bg-[#f8f8f6] p-4">
        <button
          onClick={finishSession}
          className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ backgroundColor: LIME, color: "#111" }}
        >
          Finir la séance — {formatElapsed(elapsed)}
        </button>
      </div>
    </div>
  )
}
