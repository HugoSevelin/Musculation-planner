"use client"

import { useState, useMemo } from "react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Exercise, MuscleGroup } from "@/lib/types"
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS } from "@/lib/exercises"

interface ExercisePickerProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export function ExercisePicker({ exercises, onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | "all">("all")

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase())
      const matchesGroup = selectedGroup === "all" || ex.muscleGroup === selectedGroup
      return matchesQuery && matchesGroup
    })
  }, [exercises, query, selectedGroup])

  // Group by muscle group for display
  const grouped = useMemo(() => {
    const map = new Map<MuscleGroup, Exercise[]>()
    for (const ex of filtered) {
      const group = map.get(ex.muscleGroup) ?? []
      group.push(ex)
      map.set(ex.muscleGroup, group)
    }
    return map
  }, [filtered])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <HugeiconsIcon icon={Search01Icon} size={16} color="#555" />
        <input
          autoFocus
          type="text"
          placeholder="Rechercher un exercice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#e8e8e0] placeholder-[#555] focus:outline-none"
        />
        <button onClick={onClose} className="text-[#555] hover:text-[#e8e8e0]">
          <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" />
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-2 scrollbar-none">
        <button
          onClick={() => setSelectedGroup("all")}
          className="shrink-0 border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors"
          style={{
            borderColor: selectedGroup === "all" ? "#e03030" : "rgba(255,255,255,0.1)",
            color: selectedGroup === "all" ? "#e03030" : "#555",
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
              borderColor: selectedGroup === group ? "#e03030" : "rgba(255,255,255,0.1)",
              color: selectedGroup === group ? "#e03030" : "#555",
            }}
          >
            {MUSCLE_GROUP_LABELS[group]}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.size === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#555]">Aucun exercice trouvé</p>
        )}
        {ALL_MUSCLE_GROUPS.filter((g) => grouped.has(g)).map((group) => (
          <div key={group}>
            <div className="sticky top-0 bg-[#0a0a0a] px-4 py-2 text-[10px] uppercase tracking-widest text-[#e03030]">
              {MUSCLE_GROUP_LABELS[group]}
            </div>
            {grouped.get(group)!.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-sm text-[#e8e8e0]">{ex.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#555]">
                  {ex.compound ? "Poly" : "Iso"}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
