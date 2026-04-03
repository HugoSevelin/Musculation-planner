"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Program } from "@/lib/types"

const DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
// Days in program are Mon(0)…Sun(6), JS getDay() is Sun=0…Sat=6
const JS_TO_PROGRAM_INDEX = [6, 0, 1, 2, 3, 4, 5]

export function TodayView() {
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    setPrograms(storage.programs.get())
  }, [])

  const today = new Date()
  const dayName = DAY_NAMES_FR[today.getDay()]
  const programDayIndex = JS_TO_PROGRAM_INDEX[today.getDay()]

  // Find the first active program and its day for today
  const activeProgram = programs[0] ?? null
  const todayDay = activeProgram?.days[programDayIndex] ?? null

  return (
    <div className="flex flex-col px-4 pt-6">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#555]">{dayName}</p>
        <p className="font-mono text-xs text-[#555]">
          {today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {!activeProgram && (
        <div className="border border-white/10 p-6">
          <p className="text-sm text-[#555]">Aucun programme actif.</p>
          <p className="mt-1 text-xs text-[#555]">Crée un programme dans l&apos;onglet Programme.</p>
        </div>
      )}

      {activeProgram && todayDay && (
        <div className="border border-white/10">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#555]">{activeProgram.name}</p>
            <p className="mt-1 text-sm text-[#e8e8e0]">{todayDay.name}</p>
          </div>

          {todayDay.type === "rest" ? (
            <div className="px-4 py-6">
              <p className="text-sm text-[#555]">Jour de repos</p>
            </div>
          ) : todayDay.exercises.length === 0 ? (
            <div className="px-4 py-6">
              <p className="text-sm text-[#555]">Aucun exercice planifié.</p>
            </div>
          ) : (
            <div>
              {todayDay.exercises.map((ex, i) => {
                const exercise = storage.exercises.get().find((e) => e.id === ex.exerciseId)
                return (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <span className="text-sm text-[#e8e8e0]">{exercise?.name ?? "?"}</span>
                    <span className="font-mono text-xs text-[#555]">
                      {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ""}
                      {ex.weight ? ` — ${ex.weight}kg` : ""}
                      {ex.duration ? `${Math.round(ex.duration / 60)}min` : ""}
                    </span>
                  </div>
                )
              })}
              <button className="w-full border-t border-white/10 py-4 text-xs uppercase tracking-widest text-[#e03030] transition-opacity hover:opacity-70">
                Commencer la séance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
