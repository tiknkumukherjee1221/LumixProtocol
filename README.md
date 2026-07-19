# LumixProtocol

[![CI](https://github.com/tiknkumukherjee1221/LumixProtocol/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tiknkumukherjee1221/LumixProtocol/actions/workflows/ci.yml)
[![Network](https://img.shields.io/badge/network-Stellar%20Testnet-blue)](https://soroban-testnet.stellar.org)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](package.json)

**LumixProtocol** is a privacy protocol on Stellar/Soroban: a shielded pool with
Groth16 (BLS12-381) zero-knowledge proofs, CCTP-based USDC bridging from EVM
chains, MPC-matched RFQ settlement, and compliance-aware association sets —
plus the services, SDK, and Next.js frontend that operate it.

## Architecture

| Layer | What it does |
|-------|--------------|
| **Soroban contracts** (`contracts/stellar`) | Shielded pool, commitment tree (Lean IMT), nullifier registry, compliance registry, vault, intent escrow, governance guardian, and seven Groth16 verifier contracts |
| **ZK circuits** (`circuits/`) | Circom/BLS12-381 circuits: withdraw, private transfer, deposit note mint, proof-of-fill claim, MPC settlement (plain + priced), compliance membership |
| **Services** (`apps/`) | `api` (Fastify + Postgres), `prover`, `relayer`, `solver`, `root-auditor`, `mpc-committee` (coordinator + nodes), `cli` (e2e drivers) |
| **Packages** (`packages/`) | SDK, note vault crypto, Privy auth, CCTP utils, RFQ types/atomic settlement, MPC crypto, Stellar/EVM utils, shared types |
| **Frontend** (`frontend/`) | Next.js 16 app — Privy auth, deposit/withdraw/move flows, dashboard, activity, reports |
| **Database** (`db/migrations`) | Postgres schema, applied idempotently via `npm run db:migrate` |

## Deployed contracts — Stellar Testnet

Active deployment on Stellar Testnet (RPC `https://soroban-testnet.stellar.org`,
passphrase `Test SDF Network ; September 2015`). The manifest
[`deployment/testnet.json`](deployment/testnet.json) is the **source of truth**;
[`.env.generated`](.env.generated) is derived from it and loaded automatically.
All addresses below are verified live by `npm run deployment:verify`.

Deployer (public): `GBC3JOFTC6ETGJUFJDGP5CO3R6QFNEXKEOICQBGM647DM4W7LFLRCJYF`

### Core contracts

| Contract | Address |
|----------|---------|
| Shielded Pool (canonical) | `CCXN7UIMZIIGQWAY7M7D7BXNBCG2QDLO6H7AO56CFYCNTTL7T7ZERQAY` |
| Nullifier Registry | `CCIFVB7V3EBFTZPC6CSETK6TCY65DBQ76K6JBEZQGXRVKR3JK3PVRRHC` |
| Commitment Tree | `CBKXFY7CJSUGSCRZDVMVMTPUQOAFDCLRIYCRQZRD3METW2XQWQ7HKB5Z` |
| Compliance Registry | `CCEEUG7MYJKIC4OSPWXEQWHQ5PZNAADNJ47Y6EQXINTCE3JJ3WOSMEOL` |
| Vault | `CAPQCD54GKZZNZWZHP2CMF7UW74KYK5ECMDNMJUX7AWU33JMV6KL2S6I` |
| Intent Escrow | `CA5T37RAKCTDFTC3S2CPBJUA76O5HNESJTOEILW75A5AU5CIIIFAJW23` |
| Governance Guardian | `CCGIMW75FVAD26TGS6DHK3TMAXPLO3VYXLQV2WVFLBALSG6MOBX477TR` |

### Groth16 verifiers

| Verifier | Address |
|----------|---------|
| Withdraw | `CDQ42KYGBMDY6QJR5K4ONCEA4YAB7FGIMCRZFBBIF75EO5YRVVTSTIP5` |
| Private Transfer | `CCCEBVSN52ADSU3WNGPUYA6C5FYTZYKTG4XUUQCMYZEAYERTUXTXWQ2O` |
| Deposit Note Mint | `CBQQJO4BGBQ2AXDBLYHACMIPM6IXYEBZSYXATYZSB5GINNWW57OYWPXU` |
| MPC Settlement | `CAWTIHHAZTKFKNFT6GA67EUVQNHK4Z6QSULPDUZNQ5AODEKJY5HMU7PB` |
| MPC Priced Settlement | `CCMBO2Q7NTFSQDLTCKBHCW2VAK3JGLFPGLJP44MDWPBJZNIM2PMYJ4ZO` |
| Compliance Membership | `CAFWKSOXIKWYOS565TDZJ4F32UJTSESL5ZTOLKWITRQMUVURA3SNSO6Y` |
| Proof-of-Fill Claim | `CCXXFBLCOW5KQTAIXZBZFF3X2ABIJ3FAISDDT5AFGLZNM2AJIXOMC3M7` |

### Asset contracts (SACs)

| Asset | Address |
|-------|---------|
| USDC | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| XLM | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

> Contract IDs are not transaction hashes; a transaction hash must come from a
> signed receipt. Do not hard-code a different Testnet deployment in application
> code — regenerate `.env.generated` from the manifest instead.

## Repository layout

```
apps/          application services (api, prover, relayer, solver, root-auditor,
               mpc-committee, cli, web)
packages/      reusable libraries and the SDK
contracts/     Soroban (Rust) contract workspace + standalone lean_imt crate
circuits/      Circom ZK circuits (BLS12-381)
frontend/      production Next.js frontend (built in CI)
db/            Postgres migrations
deployment/    deployment manifests (testnet.json = source of truth)
docs/          technical documentation
scripts/       build, test, lint, migration, and deployment utilities
tools/         auxiliary tooling (e.g. circom2soroban)
```

## Getting started

Prerequisites: Node.js ≥ 22, Postgres (for API tests), Rust stable (for
contract tests), and optionally `stellar-cli` + `circom` for deployments.

```bash
npm ci
cp .env.example .env          # secrets only needed for write/e2e flows
npm run db:migrate            # requires local Postgres (lumixprotocol/lumixprotocol)
npm run typecheck
npm run test:ts

# frontend
npm --prefix frontend ci
npm --prefix frontend run dev      # http://localhost:3000
```

The API loads `.env` plus the checked-in `.env.generated`, so contract
configuration never needs to be entered manually. Browser writes use the
connected wallet; backend/CLI write flows require operator secrets in the
untracked `.env`.

## Testing

| Command | Scope |
|---------|-------|
| `npm run lint` / `npm run typecheck` | Static checks across the monorepo |
| `npm run test:ts` | 17 TypeScript suites (vault, auth, APIs, MPC, RFQ, CCTP, SDK, …) — needs Postgres |
| `npm run test:contracts` | Rust tests for the Soroban workspace and `lean_imt` |
| `npm run circuits:build && npm run circuits:test` | Real Groth16 prove/verify per circuit (local-only; needs trusted-setup `.ptau` artifacts) |
| `npm run security:gates` | Static security invariants (no secrets in services, no CLI internals, …) |
| `npm run deployment:verify` | Checks every manifest address against live Testnet RPC |
| `LUMIXPROTOCOL_TESTNET_READY=true npm run e2e:testnet:all` | Live acceptance matrix (funded accounts + operator secrets required) |

## CI/CD

Every push and pull request runs the staged pipeline in
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) — see
[`docs/ci-cd.md`](docs/ci-cd.md) for the full diagram:

```
Lint → Typecheck → ⎧ TypeScript tests (Postgres 16 service)
                   ⎨ Soroban contracts (cargo test)
                   ⎩ Frontend (lint · typecheck · next build)
                 → Security gates → CI green ✅
```

Deployment is never automatic: [`deploy.yml`](.github/workflows/deploy.yml) is
manually dispatched, guarded by the `production` environment, and requires the
`STELLAR_DEPLOYER_SECRET` secret. A failed release is rolled back by restoring
the previous manifest/WASM and rerunning `npm run deployment:verify`.

## Reproducing a deployment

```bash
brew install stellar-cli
npm ci
mkdir -p .stellar-project
stellar --config-dir "$PWD/.stellar-project" keys generate lumix-deployer --fund
npx tsx scripts/circuits-build.ts     # needs circom + ptau artifacts
npx tsx scripts/contracts-build.ts
```

Deploy the WASM files with `stellar contract deploy`, passing generated verifier
bytes from `tools/circom2soroban`, then initialize and wire the contracts in
dependency order. Record the resulting IDs in `deployment/testnet.json` and keep
the deployer secret in the Stellar CLI secure store or an untracked `.env`.

## Security

- Static security gates run in CI on every push (`npm run security:gates`).
- Service runtimes never hold user secrets; signing happens client-side or in
  guarded operator flows.
- The `shielded_pool` emits deposit/withdraw/transfer/settlement events; the
  frontend consumes Soroban `getEvents` with cursoring, dedup, and backoff.
- See [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) and
  [`docs/security-notes.md`](docs/security-notes.md).

## Documentation

| Doc | Topic |
|-----|-------|
| [`docs/ci-cd.md`](docs/ci-cd.md) | CI/CD pipeline stages and diagram |
| [`docs/zk-proof-system.md`](docs/zk-proof-system.md) | Circuits, trusted setup, verifier generation |
| [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) | Threat model and invariants |
| [`docs/cctp-arbitrum-stellar.md`](docs/cctp-arbitrum-stellar.md) | CCTP USDC bridging (Arbitrum ⇄ Stellar) |
| [`docs/MPC_SETTLEMENT.md`](docs/MPC_SETTLEMENT.md) | MPC committee matching and settlement |
| [`docs/rfq-lifecycle.md`](docs/rfq-lifecycle.md) | RFQ order lifecycle |
| [`docs/note-vault-recovery.md`](docs/note-vault-recovery.md) | Encrypted note vault backup/recovery |
| [`docs/production-readiness.md`](docs/production-readiness.md) | Production readiness review |
