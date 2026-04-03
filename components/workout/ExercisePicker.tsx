"use client"

import { useState, useMemo } from "react"
import { Cancel01Icon, Search01Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Exercise, MuscleGroup, SportType } from "@/lib/types"
import { MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS, SPORT_TYPE_LABELS } from "@/lib/exercises"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ExercisePickerProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onClose: () => void
  onExerciseCreated?: (exercise: Exercise) => void
}

const LIME = "#b8ff00"
const BORDER = "rgba(255,255,255,0.07)"
const SURFACE = "#161616"

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
    const all = storage.exercises.get()
    storage.exercises.set([...all, newEx])
    onExerciseCreated?.(newEx)
    onSelect(newEx)
  }

  const selectCls = "flex-1 border border-white/10 bg-[#1f1f1f] px-3 py-2 text-sm text-[#efefef] focus:outline-none focus:border-[#b8ff00] appearance-none"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <HugeiconsIcon icon={Search01Icon} size={16} color="#444" />
        <Input
          autoFocus
          type="text"
          placeholder="Rechercher un exercice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent p-0 h-auto text-sm text-[#efefef] placeholder:text-[#444] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-[#444] hover:text-[#efefef] hover:bg-transparent h-8 w-8"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" />
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {(["all", ...ALL_MUSCLE_GROUPS] as (MuscleGroup | "all")[]).map((group) => {
          const isActive = selectedGroup === group
          return (
            <Button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className="shrink-0 rounded-none px-3 py-1.5 h-auto text-[10px] uppercase tracking-widest font-semibold transition-all"
              style={{
                backgroundColor: isActive ? LIME : "transparent",
                color: isActive ? "#0d0d0d" : "#444",
                border: `1px solid ${isActive ? LIME : BORDER}`,
              }}
            >
              {group === "all" ? "Tout" : MUSCLE_GROUP_LABELS[group]}
            </Button>
          )
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {grouped.size === 0 && !creatingCustom && (
          <p className="px-4 py-8 text-center text-sm text-[#444]">Aucun exercice trouvé</p>
        )}

        {ALL_MUSCLE_GROUPS.filter((g) => grouped.has(g)).map((group) => (
          <div key={group}>
            {/* Group header */}
            <div
              className="sticky top-0 px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: "#0d0d0d", color: LIME }}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </div>
            {grouped.get(group)!.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
              >
                <span className="text-sm text-[#efefef]">{ex.name}</span>
                <Badge
                  className="rounded-none text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border bg-transparent"
                  style={{
                    color: ex.compound ? LIME : "#444",
                    borderColor: ex.compound ? "rgba(184,255,0,0.3)" : "rgba(255,255,255,0.07)",
                  }}
                >
                  {ex.compound ? "Poly" : "Iso"}
                </Badge>
              </button>
            ))}
          </div>
        ))}

        {/* Custom exercise */}
        <div className="px-4 py-5 mt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          {!creatingCustom ? (
            <Button
              onClick={() => setCreatingCustom(true)}
              className="flex w-full items-center justify-center gap-2 rounded-none py-4 h-auto text-sm font-semibold uppercase tracking-widest hover:opacity-80"
              style={{
                border: `1px dashed rgba(184,255,0,0.3)`,
                color: LIME,
                backgroundColor: "rgba(184,255,0,0.05)",
              }}
            >
              <HugeiconsIcon icon={Add01Icon} size={16} color={LIME} />
              Créer un exercice personnalisé
            </Button>
          ) : (
            <div className="flex flex-col gap-4" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, padding: "16px" }}>
              <p className="text-[10px] uppercase tracking-widest text-[#444]">Nouvel exercice</p>
              <Input
                autoFocus
                type="text"
                placeholder="Nom de l'exercice..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createCustomExercise()
                  if (e.key === "Escape") setCreatingCustom(false)
                }}
                className="rounded-none border-0 border-b border-white/15 bg-transparent px-0 text-base text-[#efefef] placeholder:text-[#444] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex gap-2">
                <select value={customGroup} onChange={(e) => setCustomGroup(e.target.value as MuscleGroup)} className={selectCls}>
                  {ALL_MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</option>)}
                </select>
                <select value={customType} onChange={(e) => setCustomType(e.target.value as SportType)} className={selectCls}>
                  {(["strength", "bodyweight", "cardio", "sport"] as SportType[]).map((t) => <option key={t} value={t}>{SPORT_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createCustomExercise}
                  disabled={!customName.trim()}
                  className="flex-1 rounded-none py-3 h-auto text-sm font-bold uppercase tracking-widest disabled:opacity-30 hover:opacity-80"
                  style={{ backgroundColor: LIME, color: "#0d0d0d" }}
                >
                  Créer →
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setCreatingCustom(false); setCustomName("") }}
                  className="rounded-none px-5 py-3 h-auto text-xs uppercase tracking-widest text-[#444] hover:text-[#efefef] hover:bg-transparent"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
