"use client"

import { useState } from "react"
import { TabBar, type Tab } from "@/components/workout/TabBar"
import { TodayView } from "@/components/workout/TodayView"
import { ProgramBuilder } from "@/components/workout/ProgramBuilder"

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-[#555]">{label}</p>
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("today")

  return (
    <div className="flex min-h-svh flex-col pb-20">
      {tab === "today" && <TodayView />}
      {tab === "program" && <ProgramBuilder />}
      {tab === "history" && <Placeholder label="Historique" />}
      {tab === "stats" && <Placeholder label="Stats" />}
      {tab === "body" && <Placeholder label="Corps" />}

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
