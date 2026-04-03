"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Program, ProgramDay } from "@/lib/types"
import { WorkoutSession } from "./WorkoutSession"

const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const JS_TO_PROGRAM_INDEX = [6, 0, 1, 2, 3, 4, 5]
const LIME = "#b8ff00"

export function TodayView() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [sessionDay, setSessionDay] = useState<ProgramDay | null>(null)

  useEffect(() => {
    setPrograms(storage.programs.get())
  }, [])

  const today = new Date()
  const dayName = DAY_NAMES_FR[today.getDay()]
  const programDayIndex = JS_TO_PROGRAM_INDEX[today.getDay()]

  const activeProgram = programs[0] ?? null
  const todayDay = activeProgram?.days[programDayIndex] ?? null

  if (sessionDay) {
    return (
      <WorkoutSession
        day={sessionDay}
        onFinish={() => setSessionDay(null)}
        onCancel={() => setSessionDay(null)}
      />
    )
  }

  return (
    <div className="flex flex-col px-4 pt-6">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#999]">{dayName}</p>
        <p className="font-mono text-xs text-[#bbb]">
          {today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {!activeProgram && (
        <div className="border border-black/10 p-6">
          <p className="text-sm text-[#999]">Aucun programme actif.</p>
          <p className="mt-1 text-xs text-[#bbb]">Crée un programme dans l&apos;onglet Programme.</p>
        </div>
      )}

      {activeProgram && todayDay && (
        <div className="border border-black/10">
          <div className="border-b border-black/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#999]">{activeProgram.name}</p>
            <p className="mt-1 text-base font-semibold text-[#111]">{todayDay.name}</p>
          </div>

          {todayDay.type === "rest" ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl font-bold text-[#111]">Repos</p>
              <p className="mt-1 text-xs text-[#bbb]">Récupération active</p>
            </div>
          ) : todayDay.exercises.length === 0 ? (
            <div className="px-4 py-6">
              <p className="text-sm text-[#bbb]">Aucun exercice planifié pour ce jour.</p>
            </div>
          ) : (
            <div>
              {todayDay.exercises.map((ex, i) => {
                const exercise = storage.exercises.get().find((e) => e.id === ex.exerciseId)
                return (
                  <div key={i} className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                    <span className="text-sm text-[#111]">{exercise?.name ?? "?"}</span>
                    <span className="font-mono text-xs text-[#999]">
                      {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ""}
                      {ex.weight ? ` ${ex.weight}kg` : ""}
                      {ex.duration && !ex.sets ? `${Math.round(ex.duration / 60)}min` : ""}
                    </span>
                  </div>
                )
              })}
              <button
                onClick={() => setSessionDay(todayDay)}
                className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ backgroundColor: LIME, color: "#111" }}
              >
                Commencer la séance →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
