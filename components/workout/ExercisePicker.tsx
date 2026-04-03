"use client"

import { useState, useMemo } from "react"
import { Cancel01Icon, Search01Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Exercise, MuscleGroup, SportType } from "@/lib/types"
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS, SPORT_TYPE_LABELS } from "@/lib/exercises"
import { storage } from "@/lib/storage"

interface ExercisePickerProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onClose: () => void
  onExerciseCreated?: (exercise: Exercise) => void
}

const LIME = "#b8ff00"
const BORDER = "rgba(0,0,0,0.08)"

export function ExercisePicker({ exercises, onSelect, onClose, onExerciseCreated }: ExercisePickerProps) {
  const [query, setQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | "all">("all")
  const [creatingCustom, setCreatingCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customGroup, setCustomGroup] = useState<MuscleGroup>("chest")
  const [customType, setCustomType] = useState<SportType>("strength")

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase())
      const matchesGroup = selectedGroup === "all" || ex.muscleGroup === selectedGroup
      return matchesQuery && matchesGroup
    })
  }, [exercises, query, selectedGroup])

  const grouped = useMemo(() => {
    const map = new Map<MuscleGroup, Exercise[]>()
    for (const ex of filtered) {
      const group = map.get(ex.muscleGroup) ?? []
      group.push(ex)
      map.set(ex.muscleGroup, group)
    }
    return map
  }, [filtered])

  function createCustomExercise() {
    if (!customName.trim()) return
    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      muscleGroup: customGroup,
      type: customType,
      compound: false,
    }
    const allExercises = storage.exercises.get()
    storage.exercises.set([...allExercises, newEx])
    onExerciseCreated?.(newEx)
    onSelect(newEx)
  }

  const selectCls = "w-full border border-black/10 bg-[#f0f0ee] px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#b8ff00]"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f8f8f6]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3">
        <HugeiconsIcon icon={Search01Icon} size={16} color="#bbb" />
        <input
          autoFocus
          type="text"
          placeholder="Rechercher un exercice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#111] placeholder-[#bbb] focus:outline-none"
        />
        <button onClick={onClose} className="text-[#bbb] hover:text-[#111] transition-colors">
          <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" />
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto border-b border-black/10 px-4 py-2 scrollbar-none">
        <button
          onClick={() => setSelectedGroup("all")}
          className="shrink-0 border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors"
          style={{
            borderColor: selectedGroup === "all" ? "#111" : BORDER,
            backgroundColor: selectedGroup === "all" ? LIME : "transparent",
            color: selectedGroup === "all" ? "#111" : "#999",
          }}
        >
          Tout
        </button>
        {ALL_MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className="shrink-0 border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors"
            style={{
              borderColor: selectedGroup === group ? "#111" : BORDER,
              backgroundColor: selectedGroup === group ? LIME : "transparent",
              color: selectedGroup === group ? "#111" : "#999",
            }}
          >
            {MUSCLE_GROUP_LABELS[group]}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.size === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#bbb]">Aucun exercice trouvé</p>
        )}
        {ALL_MUSCLE_GROUPS.filter((g) => grouped.has(g)).map((group) => (
          <div key={group}>
            <div className="sticky top-0 bg-[#f8f8f6] px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#999]">
              {MUSCLE_GROUP_LABELS[group]}
            </div>
            {grouped.get(group)!.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center justify-between border-b border-black/5 px-4 py-3 text-left transition-colors hover:bg-black/5 active:bg-[#b8ff00]/20"
              >
                <span className="text-sm text-[#111]">{ex.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#bbb]">
                  {ex.compound ? "Poly" : "Iso"}
                </span>
              </button>
            ))}
          </div>
        ))}

        {/* Custom exercise creator */}
        <div className="border-t border-black/10 px-4 py-4">
          {!creatingCustom ? (
            <button
              onClick={() => setCreatingCustom(true)}
              className="flex w-full items-center justify-center gap-2 border border-dashed border-black/20 py-3 text-xs uppercase tracking-widest text-[#999] transition-colors hover:border-[#b8ff00] hover:text-[#111]"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} color="currentColor" />
              Créer un exercice personnalisé
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-widest text-[#999]">Nouvel exercice</p>
              <input
                autoFocus
                type="text"
                placeholder="Nom de l'exercice..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createCustomExercise()
                  if (e.key === "Escape") setCreatingCustom(false)
                }}
                className="w-full border-b border-black/20 bg-transparent py-2 text-sm text-[#111] placeholder-[#bbb] focus:border-[#111] focus:outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value as MuscleGroup)}
                  className={selectCls}
                >
                  {ALL_MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</option>
                  ))}
                </select>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as SportType)}
                  className={selectCls}
                >
                  {(["strength", "bodyweight", "cardio", "sport"] as SportType[]).map((t) => (
                    <option key={t} value={t}>{SPORT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createCustomExercise}
                  disabled={!customName.trim()}
                  className="flex-1 py-2 text-xs font-semibold uppercase tracking-widest transition-colors disabled:opacity-30"
                  style={{ backgroundColor: LIME, color: "#111" }}
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setCreatingCustom(false)
                    setCustomName("")
                  }}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#999] transition-colors hover:text-[#111] border border-black/10"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
