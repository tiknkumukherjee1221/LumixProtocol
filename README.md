# LumixProtocol

This repository contains the LumixProtocol application, Soroban contracts, ZK circuits,
service workers, and Next.js frontend.

It is organized as a TypeScript monorepo with application services, reusable packages,
smart contracts, zero-knowledge circuits, database migrations, and project documentation.
The implementation and architecture are intentionally preserved as the project evolves.

## Repository layout

- `apps/` — application services and user-facing applications
- `packages/` — reusable libraries and SDK components
- `contracts/` — on-chain contract implementations
- `circuits/` — zero-knowledge circuits
- `db/` — database migrations
- `docs/` — technical documentation
- `scripts/` — local development and verification utilities

## Stellar Testnet deployment

The active deployment is Stellar Testnet (RPC `https://soroban-testnet.stellar.org`).
Public contract IDs are checked in at [`deployment/testnet.json`](deployment/testnet.json)
and are loaded automatically from [`.env.generated`](.env.generated). The project-only
deployer public key is `GBC3JOFTC6ETGJUFJDGP5CO3R6QFNEXKEOICQBGM647DM4W7LFLRCJYF`.

The canonical application contract is:

```text
SHIELDED_POOL_CONTRACT=CCXN7UIMZIIGQWAY7M7D7BXNBCG2QDLO6H7AO56CFYCNTTL7T7ZERQAY
```

To reproduce a deployment from source:

```bash
brew install stellar-cli
npm install
mkdir -p .stellar-project
stellar --config-dir "$PWD/.stellar-project" keys generate lumix-deployer --fund
node node_modules/tsx/dist/cli.mjs scripts/circuits-build.ts
node node_modules/tsx/dist/cli.mjs scripts/contracts-build.ts
```

Deploy the WASM files with `stellar contract deploy`, passing the generated verifier
bytes from `tools/circom2soroban`, then initialize and wire the contracts in dependency
order. The checked-in deployment manifest is the source of truth for the resulting IDs;
do not hard-code a different Testnet deployment in application code. Keep the deployer
seed/secret in the Stellar CLI secure store or an untracked `.env` file.

## Local development

```bash
npm install
cp .env.example .env             # add secrets only when running write/e2e flows
npm run typecheck
npm run test
cd apps/web && npm run dev       # http://localhost:3000
```

The API loads `.env` and the checked-in `.env.generated`, so contract configuration does
not need to be entered manually. Browser writes use the connected wallet; backend and CLI
write flows require the relevant secret variables in the untracked `.env`.

Run the live acceptance matrix only with funded test accounts and operator secrets:

```bash
LUMIXPROTOCOL_TESTNET_READY=true npm run e2e:testnet:all
```

## Verification and operations

```bash
npm ci
npm run lint
npm run typecheck
node --import tsx packages/note-vault/src/vault-test.ts
node --import tsx scripts/contracts-test.ts
npm run deployment:verify
npm run frontend:install
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

CI runs these gates on every push and pull request. Contract writes are never automatic:
`deploy.yml` is manually dispatched with `STELLAR_DEPLOYER_SECRET` and a selected WASM
artifact. A failed release is rolled back by restoring the previous manifest/WASM release
and rerunning verification; secrets are not committed.

### Event architecture

The canonical `shielded_pool` emits deposit, withdrawal, transfer, settlement, asset, and
administrative events. The frontend reads Soroban `getEvents`, keeps a ledger cursor,
deduplicates events, and polls with exponential backoff so RPC outages automatically
transition to `reconnecting` and resynchronize. Backend job progress remains available
through `/v1/jobs/:id` and is rendered by `LiveLog`.

### Evidence and limitations

The checked-in Testnet canonical pool address is the contract deployment address above.
This checkout has no `.git` directory, so commit count and authorship cannot be verified.
Contract IDs are not transaction hashes; a transaction hash must come from a signed receipt.
The deployment manifest and generated test report preserve recorded Testnet evidence, while
`npm run deployment:verify` checks the live RPC and manifest format.

## Deployment status

All Soroban crates in `contracts/stellar` and all seven current Groth16 verifier
instances have been freshly deployed and wired on Stellar Testnet. The verifier keys
were generated from the local BLS12-381 ceremony artifact used by this source tree.
