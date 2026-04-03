"use client"

import { Home01Icon, Calendar01Icon, Clock01Icon, Analytics01Icon, User02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export type Tab = "today" | "program" | "history" | "stats" | "body"

const TABS: { id: Tab; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0a0a]">
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors"
              style={{ color: isActive ? "#e03030" : "#555" }}
            >
              <HugeiconsIcon
                icon={tab.icon}
                size={20}
                color={isActive ? "#e03030" : "#555"}
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
