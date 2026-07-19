"use client"

import { useEffect, useRef, useState } from "react"

export type SorobanEvent = { id?: string; ledger?: number; ledgerClosedAt?: string; contractId?: string; topic?: unknown[]; value?: unknown }
type RpcResponse = { result?: { events?: SorobanEvent[]; latestLedger?: number }; error?: { message?: string } }
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org"
const CONTRACT_ID = process.env.NEXT_PUBLIC_SHIELDED_POOL_CONTRACT

async function getEvents(startLedger?: number): Promise<{ events: SorobanEvent[]; latestLedger?: number }> {
  if (!CONTRACT_ID) return { events: [] }
  const response = await fetch(RPC_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "getEvents", params: { ...(startLedger ? { startLedger } : {}), filters: [{ type: "contract", contractIds: [CONTRACT_ID] }], pagination: { limit: 100 } } }), cache: "no-store" })
  if (!response.ok) throw new Error(`Soroban RPC returned HTTP ${response.status}`)
  const payload = (await response.json()) as RpcResponse
  if (payload.error) throw new Error(payload.error.message ?? "Soroban event query failed")
  return { events: payload.result?.events ?? [], latestLedger: payload.result?.latestLedger }
}

export function usePoolEvents(enabled = true, intervalMs = 5000) {
  const [events, setEvents] = useState<SorobanEvent[]>([])
  const [status, setStatus] = useState<"connecting" | "live" | "reconnecting" | "disabled">(CONTRACT_ID ? "connecting" : "disabled")
  const cursor = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!enabled || !CONTRACT_ID) return
    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let backoff = intervalMs
    const poll = async () => {
      try {
        const result = await getEvents(cursor.current)
        if (disposed) return
        setEvents((current) => [...result.events, ...current].filter((event, index, all) => !event.id || all.findIndex((candidate) => candidate.id === event.id) === index).slice(0, 50))
        if (result.latestLedger) cursor.current = result.latestLedger + 1
        setStatus("live"); backoff = intervalMs
      } catch { if (!disposed) setStatus("reconnecting"); backoff = Math.min(backoff * 2, 30_000) }
      finally { if (!disposed) timer = setTimeout(poll, backoff) }
    }
    void poll()
    return () => { disposed = true; if (timer) clearTimeout(timer) }
  }, [enabled, intervalMs])
  return { events, status }
}
