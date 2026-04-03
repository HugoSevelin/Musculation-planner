"use client"

import { useState, useEffect } from "react"
import { Add01Icon, ArrowLeft01Icon, Delete01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { storage } from "@/lib/storage"
import type { Program, ProgramDay, ProgramExercise, Exercise } from "@/lib/types"
import { MUSCLE_GROUP_LABELS } from "@/lib/exercises"
import { ExercisePicker } from "./ExercisePicker"

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const DAY_SHORT = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"]
const LIME = "#b8ff00"

function makeId() {
  return Math.random().toString(36).slice(2)
}

function makeDefaultProgram(name: string): Program {
  return {
    id: makeId(),
    name,
    days: DAY_NAMES.map((dayName, i) => ({
      id: makeId(),
      name: dayName,
      type: i >= 5 ? "rest" : "workout",
      exercises: [],
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

type View =
  | { type: "programs" }
  | { type: "week"; programId: string }
  | { type: "day"; programId: string; dayIndex: number }

function formatTarget(ex: ProgramExercise, exercise: Exercise): string {
  if (exercise.type === "strength" || exercise.type === "bodyweight") {
    const parts = []
    if (ex.sets) parts.push(`${ex.sets}×${ex.reps ?? "?"}`)
    if (ex.weight) parts.push(`${ex.weight}kg`)
    return parts.join(" — ") || "—"
  }
  if (exercise.type === "cardio" || exercise.type === "sport") {
    const parts = []
    if (ex.duration) parts.push(`${Math.round(ex.duration / 60)}min`)
    if (ex.distance) parts.push(`${ex.distance}m`)
    return parts.join(" / ") || "—"
  }
  return "—"
}

function ExerciseParamEditor({
  progEx,
  exercise,
  onChange,
}: {
  progEx: ProgramExercise
  exercise: Exercise
  onChange: (updated: Partial<ProgramExercise>) => void
}) {
  const inputCls =
    "w-14 border-b border-black/20 bg-transparent text-center font-mono text-sm text-[#111] focus:border-[#b8ff00] focus:outline-none"

  if (exercise.type === "strength" || exercise.type === "bodyweight") {
    return (
      <div className="flex items-center gap-2 text-[#bbb]">
        <input
          type="number"
          min={1}
          value={progEx.sets ?? ""}
          onChange={(e) => onChange({ sets: Number(e.target.value) || undefined })}
          className={inputCls}
          placeholder="Sér"
        />
        <span className="text-xs">×</span>
        <input
          type="number"
          min={1}
          value={progEx.reps ?? ""}
          onChange={(e) => onChange({ reps: Number(e.target.value) || undefined })}
          className={inputCls}
          placeholder="Rép"
        />
        {exercise.type === "strength" && (
          <>
            <span className="text-xs">—</span>
            <input
              type="number"
              min={0}
              step={2.5}
              value={progEx.weight ?? ""}
              onChange={(e) => onChange({ weight: Number(e.target.value) || undefined })}
              className={inputCls}
              placeholder="kg"
            />
            <span className="text-[10px] text-[#999]">kg</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-[#bbb]">
      <input
        type="number"
        min={1}
        value={progEx.duration ? Math.round(progEx.duration / 60) : ""}
        onChange={(e) => onChange({ duration: Number(e.target.value) * 60 || undefined })}
        className={inputCls}
        placeholder="min"
      />
      <span className="text-[10px] text-[#999]">min</span>
      {exercise.type === "cardio" && (
        <>
          <span className="text-xs">/</span>
          <input
            type="number"
            min={0}
            value={progEx.distance ?? ""}
            onChange={(e) => onChange({ distance: Number(e.target.value) || undefined })}
            className={inputCls}
            placeholder="m"
          />
          <span className="text-[10px] text-[#999]">m</span>
        </>
      )}
    </div>
  )
}

export function ProgramBuilder() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [view, setView] = useState<View>({ type: "programs" })
  const [showPicker, setShowPicker] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newProgramName, setNewProgramName] = useState("")
  const [creatingProgram, setCreatingProgram] = useState(false)

  useEffect(() => {
    setPrograms(storage.programs.get())
    setExercises(storage.exercises.get())
  }, [])

  function save(updated: Program[]) {
    setPrograms(updated)
    storage.programs.set(updated)
  }

  function createProgram() {
    if (!newProgramName.trim()) return
    const p = makeDefaultProgram(newProgramName.trim())
    save([...programs, p])
    setNewProgramName("")
    setCreatingProgram(false)
    setView({ type: "week", programId: p.id })
  }

  function deleteProgram(id: string) {
    save(programs.filter((p) => p.id !== id))
    if (view.type !== "programs") setView({ type: "programs" })
  }

  function renameProgram(id: string, name: string) {
    save(programs.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p)))
    setEditingName(null)
  }

  function updateDay(programId: string, dayIndex: number, patch: Partial<ProgramDay>) {
    save(
      programs.map((p) => {
        if (p.id !== programId) return p
        const days = p.days.map((d, i) => (i === dayIndex ? { ...d, ...patch } : d))
        return { ...p, days, updatedAt: Date.now() }
      }),
    )
  }

  function toggleDayType(programId: string, dayIndex: number) {
    const program = programs.find((p) => p.id === programId)!
    const day = program.days[dayIndex]
    updateDay(programId, dayIndex, {
      type: day.type === "rest" ? "workout" : "rest",
      exercises: [],
    })
  }

  function addExercise(programId: string, dayIndex: number, exercise: Exercise) {
    const program = programs.find((p) => p.id === programId)!
    const day = program.days[dayIndex]
    const newEx: ProgramExercise = { exerciseId: exercise.id }
    if (exercise.type === "strength") {
      newEx.sets = 3; newEx.reps = 8
    } else if (exercise.type === "bodyweight") {
      newEx.sets = 3; newEx.reps = 10
    } else {
      newEx.duration = 30 * 60
    }
    updateDay(programId, dayIndex, { exercises: [...day.exercises, newEx] })
    setShowPicker(false)
  }

  function removeExercise(programId: string, dayIndex: number, exIndex: number) {
    const program = programs.find((p) => p.id === programId)!
    const day = program.days[dayIndex]
    updateDay(programId, dayIndex, {
      exercises: day.exercises.filter((_, i) => i !== exIndex),
    })
  }

  function updateExercise(programId: string, dayIndex: number, exIndex: number, patch: Partial<ProgramExercise>) {
    const program = programs.find((p) => p.id === programId)!
    const day = program.days[dayIndex]
    const updated = day.exercises.map((ex, i) => (i === exIndex ? { ...ex, ...patch } : ex))
    updateDay(programId, dayIndex, { exercises: updated })
  }

  function getProgram(id: string) {
    return programs.find((p) => p.id === id)
  }

  function getExercise(id: string) {
    return exercises.find((e) => e.id === id)
  }

  // ── Programs list ─────────────────────────────────────────────────────────

  if (view.type === "programs") {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
          <h1 className="text-xs uppercase tracking-[0.2em] text-[#111]">Programmes</h1>
          <button onClick={() => setCreatingProgram(true)} className="transition-opacity hover:opacity-60">
            <HugeiconsIcon icon={Add01Icon} size={20} color="#111" />
          </button>
        </div>

        {creatingProgram && (
          <div className="flex items-center gap-3 border-b border-black/10 bg-[#f0f0ee] px-4 py-3">
            <input
              autoFocus
              type="text"
              placeholder="Nom du programme..."
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createProgram()
                if (e.key === "Escape") { setCreatingProgram(false); setNewProgramName("") }
              }}
              className="flex-1 bg-transparent text-sm text-[#111] placeholder-[#bbb] focus:outline-none"
            />
            <button onClick={createProgram} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1" style={{ backgroundColor: LIME, color: "#111" }}>
              Créer
            </button>
            <button onClick={() => { setCreatingProgram(false); setNewProgramName("") }} className="text-[10px] uppercase tracking-widest text-[#999]">
              Annuler
            </button>
          </div>
        )}

        {programs.length === 0 && !creatingProgram && (
          <p className="px-4 py-12 text-center text-sm text-[#bbb]">
            Aucun programme.<br />Crée ton premier programme.
          </p>
        )}

        {programs.map((program) => (
          <div key={program.id} className="border-b border-black/10">
            {editingName === program.id ? (
              <div className="flex items-center gap-3 bg-[#f0f0ee] px-4 py-3">
                <input
                  autoFocus
                  type="text"
                  defaultValue={program.name}
                  onBlur={(e) => renameProgram(program.id, e.target.value || program.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameProgram(program.id, (e.target as HTMLInputElement).value || program.name)
                    if (e.key === "Escape") setEditingName(null)
                  }}
                  className="flex-1 bg-transparent text-sm text-[#111] focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  className="flex flex-1 items-center justify-between px-4 py-4 text-left transition-colors hover:bg-black/5"
                  onClick={() => setView({ type: "week", programId: program.id })}
                >
                  <div>
                    <p className="text-sm font-medium text-[#111]">{program.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#999]">
                      {program.days.filter((d) => d.type === "workout").length}j / sem
                    </p>
                  </div>
                  <span className="text-[#bbb]">→</span>
                </button>
                <button onClick={() => setEditingName(program.id)} className="px-3 py-4 text-[#bbb] hover:text-[#111] transition-colors">
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} color="currentColor" />
                </button>
                <button onClick={() => deleteProgram(program.id)} className="px-3 py-4 text-[#bbb] hover:text-[#ff3300] transition-colors">
                  <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
                </button>
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
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4">
          <button onClick={() => setView({ type: "programs" })} className="text-[#bbb] hover:text-[#111] transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" />
          </button>
          <h1 className="flex-1 text-sm font-medium text-[#111]">{program.name}</h1>
        </div>

        {program.days.map((day, i) => {
          const isRest = day.type === "rest"
          return (
            <div key={day.id} className="border-b border-black/10">
              <div className="flex items-center">
                <button
                  onClick={() => !isRest && setView({ type: "day", programId: program.id, dayIndex: i })}
                  className="flex flex-1 items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-black/5"
                  disabled={isRest}
                >
                  <span className="w-8 shrink-0 font-mono text-[10px] text-[#bbb] pt-0.5">
                    {DAY_SHORT[i]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: isRest ? "#bbb" : "#111" }}>
                      {day.name}
                    </p>
                    {!isRest && day.exercises.length > 0 && (
                      <p className="mt-0.5 truncate text-[11px] text-[#999]">
                        {day.exercises.slice(0, 3).map((ex) => getExercise(ex.exerciseId)?.name ?? "?").join(" · ")}
                        {day.exercises.length > 3 && ` +${day.exercises.length - 3}`}
                      </p>
                    )}
                    {!isRest && day.exercises.length === 0 && (
                      <p className="mt-0.5 text-[11px] text-[#bbb]">Aucun exercice</p>
                    )}
                  </div>
                  {!isRest && <span className="text-[#bbb]">→</span>}
                </button>

                <button
                  onClick={() => toggleDayType(program.id, i)}
                  className="px-4 py-4 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                  style={{ color: isRest ? "#ff3300" : "#bbb" }}
                >
                  {isRest ? "Repos" : "Actif"}
                </button>
              </div>
            </div>
          )
        })}
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
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4">
          <button onClick={() => setView({ type: "week", programId: view.programId })} className="text-[#bbb] hover:text-[#111] transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" />
          </button>
          <div className="flex-1">
            <DayNameEditor
              name={day.name}
              onChange={(name) => updateDay(view.programId, view.dayIndex, { name })}
            />
            <p className="text-[10px] uppercase tracking-wider text-[#bbb]">{DAY_NAMES[view.dayIndex]}</p>
          </div>
        </div>

        {day.exercises.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#bbb]">Aucun exercice. Ajoute-en un.</p>
        )}

        {day.exercises.map((progEx, exIndex) => {
          const exercise = getExercise(progEx.exerciseId)
          if (!exercise) return null
          return (
            <div key={exIndex} className="border-b border-black/10 px-4 py-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111]">{exercise.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#999]">
                    {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                  </p>
                </div>
                <button onClick={() => removeExercise(view.programId, view.dayIndex, exIndex)} className="text-[#bbb] hover:text-[#ff3300] transition-colors">
                  <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
                </button>
              </div>
              <ExerciseParamEditor
                progEx={progEx}
                exercise={exercise}
                onChange={(patch) => updateExercise(view.programId, view.dayIndex, exIndex, patch)}
              />
            </div>
          )
        })}

        <button
          onClick={() => setShowPicker(true)}
          className="mx-4 mt-6 flex items-center justify-center gap-2 border border-dashed border-black/20 py-3 text-xs uppercase tracking-widest text-[#999] transition-colors hover:border-[#111] hover:text-[#111]"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" />
          Ajouter un exercice
        </button>

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

function DayNameEditor({ name, onChange }: { name: string; onChange: (name: string) => void }) {
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
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") { setValue(name); setEditing(false) }
        }}
        className="bg-transparent text-sm font-medium text-[#111] focus:outline-none"
      />
    )
  }

  return (
    <button onClick={() => { setValue(name); setEditing(true) }} className="flex items-center gap-1 text-sm font-medium text-[#111] hover:opacity-60 transition-opacity">
      {name}
      <HugeiconsIcon icon={PencilEdit01Icon} size={12} color="#bbb" />
    </button>
  )
}
