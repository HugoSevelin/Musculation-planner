"use client"

import { useState } from "react"
import { TabBar, type Tab } from "@/components/workout/TabBar"
import { TodayView } from "@/components/workout/TodayView"
import { ProgramBuilder } from "@/components/workout/ProgramBuilder"
import { WorkoutSession } from "@/components/workout/WorkoutSession"
import { HistoryView } from "@/components/workout/HistoryView"
import { StatsView } from "@/components/workout/StatsView"
import type { ProgramDay } from "@/lib/types"

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-[#444]">{label}</p>
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("today")
  const [activeSession, setActiveSession] = useState<ProgramDay | null>(null)

  // Fullscreen session — no TabBar
  if (activeSession) {
    return (
      <div className="flex min-h-svh flex-col bg-[#0d0d0d]">
        <WorkoutSession
          day={activeSession}
          onFinish={() => setActiveSession(null)}
          onCancel={() => setActiveSession(null)}
          onGoToHistory={() => setTab("history")}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#0d0d0d] pb-20">
      {tab === "today" && (
        <TodayView
          onGoToProgram={() => setTab("program")}
          onStartSession={(day) => setActiveSession(day)}
        />
      )}
      {tab === "program" && <ProgramBuilder />}
      {tab === "history" && <HistoryView />}
      {tab === "stats" && <StatsView />}
      {tab === "body" && <Placeholder label="Corps" />}

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
