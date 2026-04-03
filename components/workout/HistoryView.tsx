"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Session, Exercise } from "@/lib/types"

const LIME = "#b8ff00"
const BORDER = "rgba(255,255,255,0.07)"
const SURFACE = "#161616"

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}`
  return `${m}min${String(s % 60).padStart(2, "0")}s`
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function HistoryView() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSessions([...storage.sessions.get()].reverse())
    setExercises(storage.exercises.get())
  }, [])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function getExerciseName(id: string) {
    return exercises.find((e) => e.id === id)?.name ?? "?"
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col px-4 pt-6">
        <div className="px-4 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">Historique</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#efefef]">Tes séances</p>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-[#efefef]">Aucune séance enregistrée</p>
          <p className="text-xs text-[#444]">Lance une séance depuis l&apos;onglet Séance pour commencer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">Historique</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[#efefef]">
          {sessions.length} séance{sessions.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-3 px-4 py-4">
        {sessions.map((session) => {
          const duration = session.finishedAt
            ? session.finishedAt - session.startedAt
            : null
          const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
          const totalVolume = session.exercises.reduce((acc, ex) =>
            acc + ex.sets.reduce((s, set) =>
              s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0)
          const isOpen = expanded.has(session.id)

          return (
            <div key={session.id} style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
              {/* Session header — clickable */}
              <button
                onClick={() => toggleExpand(session.id)}
                className="flex w-full items-start justify-between px-4 py-4 text-left"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#444]">
                    {formatDate(session.date)}
                  </p>
                  <p className="text-base font-bold text-[#efefef]">
                    {session.exercises.length} exercice{session.exercises.length > 1 ? "s" : ""}
                    <span className="ml-2 font-mono text-xs font-normal text-[#555]">
                      · {totalSets} séries
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                  {duration && (
                    <span className="font-mono text-sm font-black" style={{ color: LIME }}>
                      {formatDuration(duration)}
                    </span>
                  )}
                  {totalVolume > 0 && (
                    <span className="font-mono text-[10px] text-[#444]">
                      {totalVolume.toLocaleString("fr-FR")} kg
                    </span>
                  )}
                  <span className="mt-1 text-[10px] text-[#333]">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${BORDER}` }}>
                  {session.exercises.map((ex, i) => {
                    const isLast = i === session.exercises.length - 1
                    const maxWeight = Math.max(...ex.sets.map((s) => s.weight ?? 0))
                    const totalReps = ex.sets.reduce((acc, s) => acc + (s.reps ?? 0), 0)
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: isLast ? "none" : `1px solid rgba(255,255,255,0.04)` }}
                      >
                        <span className="text-sm text-[#efefef]">{getExerciseName(ex.exerciseId)}</span>
                        <span className="font-mono text-xs" style={{ color: LIME }}>
                          {ex.sets.length}×
                          {maxWeight > 0 ? `${maxWeight}kg` : totalReps > 0 ? `${Math.round(totalReps / ex.sets.length)} reps` : "—"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
