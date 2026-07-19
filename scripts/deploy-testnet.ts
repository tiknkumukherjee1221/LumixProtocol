import { readFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"

const manifest = JSON.parse(await readFile("deployment/testnet.json", "utf8")) as { network: string; rpcUrl: string }
if (manifest.network !== "stellar-testnet") throw new Error("Refusing to deploy: manifest is not Stellar testnet")
if (!process.env.STELLAR_DEPLOYER_SECRET) throw new Error("STELLAR_DEPLOYER_SECRET is required and must be supplied by the CI secret store")
if (!process.env.CONTRACT_WASM) throw new Error("CONTRACT_WASM must point to one built WASM artifact")
const result = spawnSync("stellar", ["contract", "deploy", "--wasm", process.env.CONTRACT_WASM, "--source", process.env.STELLAR_DEPLOYER_SECRET, "--network", "testnet"], { stdio: "inherit" })
process.exit(result.status ?? 1)
