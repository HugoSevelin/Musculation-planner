"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Program, ProgramDay } from "@/lib/types"
import { Button } from "@/components/ui/button"

const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const JS_TO_PROGRAM_INDEX = [6, 0, 1, 2, 3, 4, 5]
const LIME = "#b8ff00"
const BORDER = "rgba(255,255,255,0.07)"

interface TodayViewProps {
  onGoToProgram: () => void
  onStartSession: (day: ProgramDay) => void
}

export function TodayView({ onGoToProgram, onStartSession }: TodayViewProps) {
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    setPrograms(storage.programs.get())
  }, [])

  const today = new Date()
  const dayName = DAY_NAMES_FR[today.getDay()].toUpperCase()
  const dateStr = today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const programDayIndex = JS_TO_PROGRAM_INDEX[today.getDay()]
  const activeProgram = programs[0] ?? null
  const todayDay = activeProgram?.days[programDayIndex] ?? null

  const exercises = storage.exercises.get()

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">{dateStr}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[#efefef]">{dayName}</p>
      </div>

      {/* No program */}
      {!activeProgram && (
        <div className="mx-4 mt-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="px-5 py-6">
            <p className="text-sm font-semibold text-[#efefef]">Aucun programme configuré</p>
            <p className="mt-1 text-xs text-[#555]">Crée ton premier programme pour commencer à logger tes séances.</p>
          </div>
          <Button
            onClick={onGoToProgram}
            className="flex w-full items-center justify-between rounded-none px-5 py-4 h-auto text-sm font-bold uppercase tracking-widest hover:opacity-80"
            style={{ backgroundColor: LIME, color: "#0d0d0d" }}
          >
            Créer un programme
            <span>→</span>
          </Button>
        </div>
      )}

      {/* Rest day */}
      {activeProgram && todayDay?.type === "rest" && (
        <div className="mx-4 mt-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="px-5 pt-3 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-[#444]">{activeProgram.name}</p>
          </div>
          <div className="flex flex-col items-center py-12">
            <p className="text-5xl font-black tracking-tight" style={{ color: LIME }}>REPOS</p>
            <p className="mt-3 text-xs text-[#555]">Récupération · {todayDay.name}</p>
          </div>
        </div>
      )}

      {/* Workout day — no exercises */}
      {activeProgram && todayDay?.type === "workout" && todayDay.exercises.length === 0 && (
        <div className="mx-4 mt-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="px-5 pt-3 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-[#444]">{activeProgram.name}</p>
          </div>
          <div className="px-5 py-8">
            <p className="text-lg font-bold text-[#efefef]">{todayDay.name}</p>
            <p className="mt-2 text-sm text-[#555]">Aucun exercice planifié pour ce jour.</p>
          </div>
          <Button
            variant="ghost"
            onClick={onGoToProgram}
            className="flex w-full items-center justify-between rounded-none px-5 py-4 h-auto text-xs uppercase tracking-widest text-[#444] hover:text-[#efefef] hover:bg-transparent"
            style={{ borderTop: `1px solid ${BORDER}` }}
          >
            Modifier dans Planning
            <span>→</span>
          </Button>
        </div>
      )}

      {/* Workout day — with exercises */}
      {activeProgram && todayDay?.type === "workout" && todayDay.exercises.length > 0 && (
        <div className="mx-4 mt-6" style={{ border: `1px solid ${BORDER}` }}>
          {/* Card header */}
          <div className="flex items-baseline justify-between px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#444]">{activeProgram.name}</p>
              <p className="mt-1 text-lg font-bold text-[#efefef]">{todayDay.name}</p>
            </div>
            <span className="font-mono text-xs text-[#555]">{todayDay.exercises.length} ex.</span>
          </div>

          {/* Exercise list */}
          {todayDay.exercises.map((ex, i) => {
            const exercise = exercises.find((e) => e.id === ex.exerciseId)
            const isLast = i === todayDay.exercises.length - 1
            return (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: isLast ? "none" : `1px solid rgba(255,255,255,0.04)` }}
              >
                <span className="text-sm text-[#efefef]">{exercise?.name ?? "?"}</span>
                <span className="font-mono text-xs" style={{ color: LIME }}>
                  {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ""}
                  {ex.weight ? ` · ${ex.weight}kg` : ""}
                  {ex.duration && !ex.sets ? `${Math.round(ex.duration / 60)}min` : ""}
                </span>
              </div>
            )
          })}

          {/* CTA */}
          <Button
            onClick={() => onStartSession(todayDay)}
            className="flex w-full items-center justify-between rounded-none px-5 py-4 h-auto text-sm font-bold uppercase tracking-widest hover:opacity-80"
            style={{
              backgroundColor: LIME,
              color: "#0d0d0d",
              borderTop: `1px solid ${BORDER}`,
              boxShadow: `0 -4px 20px rgba(184,255,0,0.15)`,
            }}
          >
            Commencer la séance
            <span>→</span>
          </Button>
        </div>
      )}

      {/* Tip if no program */}
      {activeProgram && (
        <div className="mx-4 mt-4 px-4 py-3 flex items-center gap-3" style={{ border: `1px solid rgba(255,255,255,0.04)`, backgroundColor: "rgba(255,255,255,0.02)" }}>
          <span className="text-base">💡</span>
          <p className="text-[11px] text-[#444]">
            Pour modifier ta séance, va dans <span className="text-[#efefef]">Planning</span>
          </p>
        </div>
      )}
    </div>
  )
}
