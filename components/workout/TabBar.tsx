"use client"

import { Home01Icon, Calendar01Icon, Clock01Icon, Analytics01Icon, User02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

// IconSvgObject is the type used by @hugeicons/core-free-icons
type IconSvgObject = Parameters<typeof HugeiconsIcon>[0]["icon"]

export type Tab = "today" | "program" | "history" | "stats" | "body"

const TABS: { id: Tab; label: string; icon: IconSvgObject }[] = [
  { id: "today", label: "Aujourd'hui", icon: Home01Icon },
  { id: "program", label: "Programme", icon: Calendar01Icon },
  { id: "history", label: "Historique", icon: Clock01Icon },
  { id: "stats", label: "Stats", icon: Analytics01Icon },
  { id: "body", label: "Corps", icon: User02Icon },
]

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-[#f8f8f6]">
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors"
              style={{ color: isActive ? "#111" : "#bbb" }}
            >
              {isActive && (
                <span
                  className="mb-0.5 block h-0.5 w-4"
                  style={{ backgroundColor: "#b8ff00" }}
                />
              )}
              <HugeiconsIcon
                icon={tab.icon}
                size={18}
                color={isActive ? "#111" : "#bbb"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
