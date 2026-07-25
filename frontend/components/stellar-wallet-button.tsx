"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { connectFreighter } from "@/lib/freighter-withdraw"

/**
 * A persistent, visible Stellar wallet entry point. The actual Freighter API
 * calls live in lib/freighter-withdraw.ts so the same permissioned account is
 * used by the withdraw transaction signer.
 */
export function StellarWalletButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connect() {
    setConnecting(true)
    setError(null)
    try {
      setAddress(await connectFreighter())
    } catch (cause) {
      setError((cause as Error).message || "Could not connect Freighter")
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        aria-label="Connect Freighter Stellar wallet"
        className="flex items-center gap-1.5 rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground hover:bg-[#2563eb]/20 disabled:opacity-40"
      >
        <Wallet className="h-3.5 w-3.5" />
        {connecting ? "Connecting…" : address ? `${address.slice(0, 5)}…${address.slice(-4)}` : "Connect Freighter"}
      </button>
      {error && <p role="alert" className="absolute right-0 top-full mt-2 w-72 rounded border border-red-400/30 bg-black p-2 font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  )
}
