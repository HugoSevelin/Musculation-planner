"use client"

import { Home01Icon, Calendar01Icon, Clock01Icon, Analytics01Icon, User02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type IconSvgObject = Parameters<typeof HugeiconsIcon>[0]["icon"]

export type Tab = "today" | "program" | "history" | "stats" | "body"

const TABS: { id: Tab; label: string; icon: IconSvgObject }[] = [
  { id: "today", label: "Séance", icon: Home01Icon },
  { id: "program", label: "Planning", icon: Calendar01Icon },
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d]" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-3 text-[9px] uppercase tracking-widest transition-all"
              style={{ color: isActive ? "#efefef" : "#444" }}
            >
              {/* Neon lime indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px"
                  style={{ backgroundColor: "#b8ff00", boxShadow: "0 0 8px #b8ff00" }}
                />
              )}
              <HugeiconsIcon
                icon={tab.icon}
                size={20}
                color={isActive ? "#b8ff00" : "#444"}
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
