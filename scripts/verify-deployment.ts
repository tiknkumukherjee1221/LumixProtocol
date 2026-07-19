import { readFile } from "node:fs/promises"

type Manifest = { network: string; rpcUrl: string; contracts: Record<string, string> }
const manifest = JSON.parse(await readFile("deployment/testnet.json", "utf8")) as Manifest
const response = await fetch(manifest.rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestLedger", params: {} }) })
if (!response.ok) throw new Error(`RPC health check failed: HTTP ${response.status}`)
const payload = await response.json() as { result?: { sequence?: number }; error?: { message?: string } }
if (payload.error || !payload.result?.sequence) throw new Error(payload.error?.message ?? "RPC returned no latest ledger")
for (const [name, id] of Object.entries(manifest.contracts)) {
  if (!/^C[A-Z2-7]{55}$/.test(id)) throw new Error(`Invalid Stellar contract ID for ${name}: ${id}`)
  console.log(`PASS ${name} ${id}`)
}
console.log(`PASS ${manifest.network} RPC latest ledger ${payload.result.sequence}`)
