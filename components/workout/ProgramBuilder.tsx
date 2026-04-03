"use client"

import { useState, useEffect } from "react"
import { Add01Icon, ArrowLeft01Icon, Delete01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { storage } from "@/lib/storage"
import type { Program, ProgramDay, ProgramExercise, Exercise } from "@/lib/types"
import { MUSCLE_GROUP_LABELS } from "@/lib/exercises"
import { ExercisePicker } from "./ExercisePicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const DAY_SHORT = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"]
const LIME = "#b8ff00"
const CYAN = "#00e5ff"
const RED = "#ff3333"
const BORDER = "rgba(255,255,255,0.07)"
const SURFACE = "#161616"

function makeId() { return Math.random().toString(36).slice(2) }

function makeDefaultProgram(name: string): Program {
  return {
    id: makeId(), name,
    days: DAY_NAMES.map((dayName, i) => ({
      id: makeId(), name: dayName,
      type: i >= 5 ? "rest" : "workout",
      exercises: [],
    })),
    createdAt: Date.now(), updatedAt: Date.now(),
  }
}

type View =
  | { type: "programs" }
  | { type: "week"; programId: string }
  | { type: "day"; programId: string; dayIndex: number }

// ── Onboarding ────────────────────────────────────────────────────────────────

function Onboarding({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col px-5 pt-8 pb-6">
      {/* Title */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#444]">Journal d'entraînement</p>
        <p className="mt-2 text-3xl font-black leading-tight text-[#efefef]">
          Planifie ta<br />semaine.
        </p>
      </div>

      {/* Steps */}
      <div className="mb-8 flex flex-col gap-px" style={{ border: `1px solid ${BORDER}` }}>
        {[
          {
            num: "01",
            title: "Nomme ton programme",
            desc: "PPL, Full Body, Upper/Lower...",
            color: LIME,
          },
          {
            num: "02",
            title: "Configure ta semaine",
            desc: "Active les jours d'entraînement, passe les autres en Repos",
            color: CYAN,
          },
          {
            num: "03",
            title: "Ajoute tes exercices",
            desc: "65 exercices · muscu, cardio, natation, sport de combat...",
            color: "#ff7700",
          },
        ].map((step, i) => (
          <div
            key={step.num}
            className="flex items-start gap-4 px-4 py-4"
            style={{
              backgroundColor: SURFACE,
              borderBottom: i < 2 ? `1px solid ${BORDER}` : "none",
            }}
          >
            <span className="font-mono text-xs font-bold pt-0.5" style={{ color: step.color }}>
              {step.num}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#efefef]">{step.title}</p>
              <p className="mt-0.5 text-xs text-[#555]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={onCreate}
        className="flex w-full items-center justify-between rounded-none px-5 py-4 h-auto text-sm font-bold uppercase tracking-widest hover:opacity-80"
        style={{ backgroundColor: LIME, color: "#0d0d0d", boxShadow: `0 0 24px rgba(184,255,0,0.25)` }}
      >
        Créer mon programme
        <span>→</span>
      </Button>

      <p className="mt-4 text-center text-[10px] text-[#333]">Données stockées localement · aucun compte requis</p>
    </div>
  )
}

// ── Param editor ──────────────────────────────────────────────────────────────

function ExerciseParamEditor({
  progEx, exercise, onChange,
}: {
  progEx: ProgramExercise; exercise: Exercise; onChange: (p: Partial<ProgramExercise>) => void
}) {
  const inputCls =
    "w-14 border-b border-white/15 bg-transparent text-center font-mono text-sm text-[#efefef] focus:border-[#b8ff00] focus:outline-none"

  if (exercise.type === "strength" || exercise.type === "bodyweight") {
    return (
      <div className="flex items-center gap-3 text-[#444]">
        <div className="flex items-center gap-1">
          <input type="number" min={1} value={progEx.sets ?? ""} onChange={(e) => onChange({ sets: Number(e.target.value) || undefined })} className={inputCls} placeholder="S" />
          <span className="text-xs text-[#333]">×</span>
          <input type="number" min={1} value={progEx.reps ?? ""} onChange={(e) => onChange({ reps: Number(e.target.value) || undefined })} className={inputCls} placeholder="R" />
        </div>
        {exercise.type === "strength" && (
          <div className="flex items-center gap-1">
            <input type="number" min={0} step={2.5} value={progEx.weight ?? ""} onChange={(e) => onChange({ weight: Number(e.target.value) || undefined })} className={inputCls} placeholder="kg" />
            <span className="text-[10px] text-[#444]">kg</span>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <input type="number" min={1} value={progEx.duration ? Math.round(progEx.duration / 60) : ""} onChange={(e) => onChange({ duration: Number(e.target.value) * 60 || undefined })} className={inputCls} placeholder="min" />
      <span className="text-[10px] text-[#444]">min</span>
      {exercise.type === "cardio" && (
        <>
          <input type="number" min={0} value={progEx.distance ?? ""} onChange={(e) => onChange({ distance: Number(e.target.value) || undefined })} className={inputCls} placeholder="m" />
          <span className="text-[10px] text-[#444]">m</span>
        </>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ProgramBuilder() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [view, setView] = useState<View>({ type: "programs" })
  const [showPicker, setShowPicker] = useState(false)
  const [creatingProgram, setCreatingProgram] = useState(false)
  const [newProgramName, setNewProgramName] = useState("")
  const [editingName, setEditingName] = useState<string | null>(null)
  const [showWeekTip, setShowWeekTip] = useState(false)

  useEffect(() => {
    setPrograms(storage.programs.get())
    setExercises(storage.exercises.get())
  }, [])

  function save(updated: Program[]) {
    setPrograms(updated)
    storage.programs.set(updated)
  }

  function createProgram(name?: string) {
    const n = (name ?? newProgramName).trim()
    if (!n) return
    const p = makeDefaultProgram(n)
    save([...programs, p])
    setNewProgramName("")
    setCreatingProgram(false)
    setShowWeekTip(true)
    setView({ type: "week", programId: p.id })
  }

  function deleteProgram(id: string) {
    save(programs.filter((p) => p.id !== id))
    setView({ type: "programs" })
  }

  function renameProgram(id: string, name: string) {
    save(programs.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p)))
    setEditingName(null)
  }

  function updateDay(programId: string, dayIndex: number, patch: Partial<ProgramDay>) {
    save(programs.map((p) => {
      if (p.id !== programId) return p
      const days = p.days.map((d, i) => (i === dayIndex ? { ...d, ...patch } : d))
      return { ...p, days, updatedAt: Date.now() }
    }))
  }

  function toggleDayType(programId: string, dayIndex: number) {
    const day = programs.find((p) => p.id === programId)!.days[dayIndex]
    updateDay(programId, dayIndex, { type: day.type === "rest" ? "workout" : "rest", exercises: [] })
  }

  function addExercise(programId: string, dayIndex: number, exercise: Exercise) {
    const day = programs.find((p) => p.id === programId)!.days[dayIndex]
    const newEx: ProgramExercise = { exerciseId: exercise.id }
    if (exercise.type === "strength") { newEx.sets = 3; newEx.reps = 8 }
    else if (exercise.type === "bodyweight") { newEx.sets = 3; newEx.reps = 10 }
    else { newEx.duration = 30 * 60 }
    updateDay(programId, dayIndex, { exercises: [...day.exercises, newEx] })
    setShowPicker(false)
  }

  function removeExercise(programId: string, dayIndex: number, exIndex: number) {
    const day = programs.find((p) => p.id === programId)!.days[dayIndex]
    updateDay(programId, dayIndex, { exercises: day.exercises.filter((_, i) => i !== exIndex) })
  }

  function updateExercise(programId: string, dayIndex: number, exIndex: number, patch: Partial<ProgramExercise>) {
    const day = programs.find((p) => p.id === programId)!.days[dayIndex]
    updateDay(programId, dayIndex, { exercises: day.exercises.map((ex, i) => i === exIndex ? { ...ex, ...patch } : ex) })
  }

  const getProgram = (id: string) => programs.find((p) => p.id === id)
  const getExercise = (id: string) => exercises.find((e) => e.id === id)

  // ── Programs list ─────────────────────────────────────────────────────────

  if (view.type === "programs") {
    const isEmpty = programs.length === 0 && !creatingProgram

    return (
      <div className="flex flex-col">
        {/* Header (only when there are programs) */}
        {!isEmpty && (
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#efefef]">Planning</p>
            <Button variant="ghost" size="icon" onClick={() => setCreatingProgram(true)} className="hover:bg-transparent hover:opacity-60">
              <HugeiconsIcon icon={Add01Icon} size={22} color="#efefef" />
            </Button>
          </div>
        )}

        {/* Empty state / Onboarding */}
        {isEmpty && <Onboarding onCreate={() => setCreatingProgram(true)} />}

        {/* Create form */}
        {creatingProgram && (
          <div className="mx-4 mt-4" style={{ border: `1px solid ${LIME}`, backgroundColor: SURFACE }}>
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-[#444]">Nouveau programme</p>
            </div>
            <Input
              autoFocus
              type="text"
              placeholder="Ex: PPL, Full Body, Ma routine..."
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createProgram()
                if (e.key === "Escape") { setCreatingProgram(false); setNewProgramName("") }
              }}
              className="rounded-none border-0 bg-transparent px-4 py-3 h-auto text-base text-[#efefef] placeholder:text-[#444] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex" style={{ borderTop: `1px solid ${BORDER}` }}>
              <Button
                onClick={() => createProgram()}
                disabled={!newProgramName.trim()}
                className="flex-1 rounded-none py-3 h-auto text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:opacity-80"
                style={{ backgroundColor: LIME, color: "#0d0d0d" }}
              >
                Créer →
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setCreatingProgram(false); setNewProgramName("") }}
                className="rounded-none px-5 py-3 h-auto text-xs uppercase tracking-widest text-[#444] hover:text-[#efefef] hover:bg-transparent"
                style={{ borderLeft: `1px solid ${BORDER}` }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Program list */}
        {programs.map((program) => (
          <div key={program.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
            {editingName === program.id ? (
              <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: SURFACE }}>
                <input
                  autoFocus
                  type="text"
                  defaultValue={program.name}
                  onBlur={(e) => renameProgram(program.id, e.target.value || program.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameProgram(program.id, (e.target as HTMLInputElement).value || program.name)
                    if (e.key === "Escape") setEditingName(null)
                  }}
                  className="flex-1 bg-transparent text-base text-[#efefef] focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-stretch">
                <button
                  className="flex flex-1 items-center justify-between px-4 py-4 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                  onClick={() => setView({ type: "week", programId: program.id })}
                >
                  <div>
                    <p className="text-base font-semibold text-[#efefef]">{program.name}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#555]">
                        {program.days.filter((d) => d.type === "workout").length}j entraînement
                      </span>
                      <span className="font-mono text-[11px] text-[#333]">·</span>
                      <span className="font-mono text-[11px] text-[#555]">
                        {program.days.reduce((acc, d) => acc + d.exercises.length, 0)} exercices
                      </span>
                    </div>
                  </div>
                  <span className="ml-4 text-lg text-[#333]">›</span>
                </button>
                <div className="flex items-center" style={{ borderLeft: `1px solid ${BORDER}` }}>
                  <Button variant="ghost" size="icon" onClick={() => setEditingName(program.id)} className="rounded-none px-3 py-4 h-auto text-[#444] hover:text-[#efefef] hover:bg-transparent">
                    <HugeiconsIcon icon={PencilEdit01Icon} size={16} color="currentColor" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProgram(program.id)} className="rounded-none px-3 py-4 h-auto text-[#444] hover:text-[#ff3333] hover:bg-transparent" style={{ borderLeft: `1px solid ${BORDER}` }}>
                    <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ── Week view ─────────────────────────────────────────────────────────────

  if (view.type === "week") {
    const program = getProgram(view.programId)
    if (!program) { setView({ type: "programs" }); return null }

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <Button variant="ghost" size="icon" onClick={() => setView({ type: "programs" })} className="text-[#444] hover:text-[#efefef] hover:bg-transparent">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="currentColor" />
          </Button>
          <p className="flex-1 text-base font-semibold text-[#efefef]">{program.name}</p>
        </div>

        {/* Tip banner */}
        {showWeekTip && (
          <div className="mx-4 mt-4 flex items-start gap-3 px-4 py-3" style={{ backgroundColor: "rgba(184,255,0,0.07)", border: `1px solid rgba(184,255,0,0.2)` }}>
            <span className="text-sm" style={{ color: LIME }}>👆</span>
            <div className="flex-1">
              <p className="text-xs text-[#efefef]">Appuie sur un jour actif pour ajouter tes exercices</p>
              <p className="mt-0.5 text-[10px] text-[#555]">Tu peux renommer chaque jour (Push, Pull, Jambes...)</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowWeekTip(false)} className="h-6 w-6 text-[#444] text-xs hover:text-[#efefef] hover:bg-transparent">✕</Button>
          </div>
        )}

        {/* Days */}
        <div className="flex flex-col mt-3">
          {program.days.map((day, i) => {
            const isRest = day.type === "rest"
            const exCount = day.exercises.length
            const preview = day.exercises.slice(0, 2).map((ex) => getExercise(ex.exerciseId)?.name ?? "?")

            return (
              <div
                key={day.id}
                className="flex items-stretch"
                style={{
                  borderBottom: `1px solid ${BORDER}`,
                  opacity: isRest ? 0.5 : 1,
                }}
              >
                {/* Left: day short */}
                <div className="flex w-14 flex-col items-center justify-center py-4 shrink-0" style={{ borderRight: `1px solid ${BORDER}` }}>
                  <span className="font-mono text-[10px] font-bold" style={{ color: isRest ? "#444" : LIME }}>
                    {DAY_SHORT[i]}
                  </span>
                </div>

                {/* Center: clickable content */}
                <button
                  className="flex flex-1 items-center justify-between px-4 py-4 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                  onClick={() => !isRest && setView({ type: "day", programId: program.id, dayIndex: i })}
                  disabled={isRest}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#efefef]">{day.name}</p>
                    {!isRest && exCount === 0 && (
                      <p className="mt-0.5 text-[11px] text-[#444]">Appuie pour ajouter des exercices</p>
                    )}
                    {!isRest && exCount > 0 && (
                      <p className="mt-0.5 truncate text-[11px] text-[#555]">
                        {preview.join(" · ")}{exCount > 2 ? ` +${exCount - 2}` : ""}
                      </p>
                    )}
                  </div>
                  {!isRest && (
                    <span className="ml-3 text-[#444] shrink-0">›</span>
                  )}
                </button>

                {/* Right: toggle */}
                <button
                  onClick={() => toggleDayType(program.id, i)}
                  className="shrink-0 px-3 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors"
                  style={{
                    borderLeft: `1px solid ${BORDER}`,
                    color: isRest ? RED : "#333",
                    minWidth: 52,
                  }}
                >
                  {isRest ? "Repos" : "Actif"}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom tip */}
        <div className="px-4 py-3 mt-2">
          <p className="text-[10px] text-[#333] text-center">
            Appuie sur <span style={{ color: RED }}>Repos</span> / <span className="text-[#333]">Actif</span> pour changer le type du jour
          </p>
        </div>
      </div>
    )
  }

  // ── Day editor ────────────────────────────────────────────────────────────

  if (view.type === "day") {
    const program = getProgram(view.programId)
    if (!program) { setView({ type: "programs" }); return null }
    const day = program.days[view.dayIndex]

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <Button variant="ghost" size="icon" onClick={() => setView({ type: "week", programId: view.programId })} className="text-[#444] hover:text-[#efefef] hover:bg-transparent">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="currentColor" />
          </Button>
          <div className="flex-1 min-w-0">
            <DayNameEditor
              name={day.name}
              onChange={(name) => updateDay(view.programId, view.dayIndex, { name })}
            />
            <p className="text-[10px] uppercase tracking-widest text-[#444]">{DAY_NAMES[view.dayIndex]}</p>
          </div>
          <span className="font-mono text-[10px] text-[#444]">{day.exercises.length} ex.</span>
        </div>

        {/* Tip if empty */}
        {day.exercises.length === 0 && (
          <div className="mx-4 mt-4 px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "rgba(0,229,255,0.06)", border: `1px solid rgba(0,229,255,0.15)` }}>
            <span style={{ color: CYAN }}>💡</span>
            <p className="text-xs text-[#efefef]">Ajoute des exercices depuis la bibliothèque (muscu, cardio, sport...)</p>
          </div>
        )}

        {/* Exercises */}
        <div className="flex flex-col mt-3">
          {day.exercises.map((progEx, exIndex) => {
            const exercise = getExercise(progEx.exerciseId)
            if (!exercise) return null
            return (
              <div key={exIndex} className="px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#efefef]">{exercise.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#444]">
                      {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeExercise(view.programId, view.dayIndex, exIndex)} className="ml-3 text-[#333] hover:text-[#ff3333] hover:bg-transparent">
                    <HugeiconsIcon icon={Delete01Icon} size={18} color="currentColor" />
                  </Button>
                </div>
                <ExerciseParamEditor
                  progEx={progEx} exercise={exercise}
                  onChange={(patch) => updateExercise(view.programId, view.dayIndex, exIndex, patch)}
                />
              </div>
            )
          })}
        </div>

        {/* Add button */}
        <Button
          onClick={() => setShowPicker(true)}
          className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-none py-4 h-auto text-sm font-semibold uppercase tracking-widest hover:opacity-80"
          style={{
            border: `1px dashed rgba(184,255,0,0.3)`,
            color: LIME,
            backgroundColor: "rgba(184,255,0,0.05)",
          }}
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color={LIME} />
          Ajouter un exercice
        </Button>

        {showPicker && (
          <ExercisePicker
            exercises={exercises}
            onSelect={(ex) => addExercise(view.programId, view.dayIndex, ex)}
            onClose={() => setShowPicker(false)}
            onExerciseCreated={(ex) => setExercises([...exercises, ex])}
          />
        )}
      </div>
    )
  }

  return null
}

// ── Day name editor ───────────────────────────────────────────────────────────

function DayNameEditor({ name, onChange }: { name: string; onChange: (n: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)

  function commit() {
    setEditing(false)
    if (value.trim()) onChange(value.trim())
    else setValue(name)
  }

  if (editing) {
    return (
      <input
        autoFocus value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") { setValue(name); setEditing(false) }
        }}
        className="bg-transparent text-base font-semibold text-[#efefef] focus:outline-none w-full"
      />
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={() => { setValue(name); setEditing(true) }}
      className="h-auto p-0 flex items-center gap-1.5 text-base font-semibold text-[#efefef] hover:opacity-70 hover:bg-transparent"
    >
      {name}
      <HugeiconsIcon icon={PencilEdit01Icon} size={12} color="#444" />
    </Button>
  )
}
