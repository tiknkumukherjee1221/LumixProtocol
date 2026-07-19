"use client"
import { usePoolEvents } from "@/lib/stellar-events"

export function ChainStatus() {
  const { events, status } = usePoolEvents()
  const label = status === "live" ? "live" : status === "reconnecting" ? "reconnecting" : "syncing"
  return <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground" aria-live="polite"><span className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "bg-emerald-400" : "bg-amber-400"}`} />{label} · {events.length} recent chain events</div>
}
