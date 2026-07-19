# LumixProtocol production-readiness report

Date: 2026-07-19  
Scope: repository, Soroban contracts, TypeScript services, frontend, CI/CD, and Testnet manifest.

## Executive summary

The contract layer is in good pre-production shape: the workspace compiles and the local
security/integration suite passes. The canonical Testnet deployment is reachable and its
manifest validates. This checkout is not yet a fully evidenced production release because
the frontend build could not complete in the constrained workspace (dependency extraction
filled the disk), no signed interaction receipt is checked in, and the workspace contains no
`.git` directory for commit-history verification.

## Architecture and security review

- `shielded_pool` is the canonical settlement contract and communicates with verifiers,
  nullifier registry, token contracts, and MPC/verifier contracts through Soroban calls.
- Validation covers pause state, admin authorization, asset registration, proof public
  signals, deadlines, nullifier replay, domain separation, quote binding, and balance/supply
  invariants.
- Contract events cover deposits, withdrawals, transfers, settlements, asset registration,
  and governance actions. Soroban currently reports deprecation warnings for the older
  `Events::publish` API; migrating to `#[contractevent]` is a follow-up before a major SDK
  upgrade.
- The event-driven frontend cursor and reconnection logic are implemented in
  `frontend/lib/stellar-events.ts` and surfaced in Activity.

## Verified tests and builds

- Root TypeScript typecheck: PASS.
- Root static lint: PASS.
- Rust Soroban workspace: PASS, 42 tests with 0 failures (37 shielded-pool, 5 governance;
  additional crates and doc tests also pass).
- Standalone `lean_imt`: PASS, 22 tests with 0 failures.
- Circuit suite: PASS, including valid proof, wrong asset, wrong amount/price, compliance,
  and wrong root rejection cases.
- TypeScript vault/auth suites: PASS; each reports multiple passing assertions.
- Frontend dependency lock: reproducible with the committed `frontend/.npmrc` compatibility
  setting. Frontend production build remains pending a host with sufficient free disk.

## Deployment evidence

Network: Stellar Testnet  
RPC verification: PASS, latest ledger `3692833`  
Canonical pool address: `CCXN7UIMZIIGQWAY7M7D7BXNBCG2QDLO6H7AO56CFYCNTTL7T7ZERQAY`  
Full address set: `deployment/testnet.json`

No transaction hash is asserted here: a contract ID is not a transaction ID, and no signed
interaction receipt is available in this checkout. Generate one with a funded test wallet,
persist the receipt, and add it to the release evidence before claiming that requirement.

## CI/CD and operations

`.github/workflows/ci.yml` runs on push and pull request: install, root lint/typecheck,
contract/circuit tests, frontend install/typecheck/lint/build, and build artifact upload.
`.github/workflows/deploy.yml` is manual, uses GitHub environment secrets, deploys a selected
WASM artifact, verifies the manifest/RPC, and documents operator rollback. `scripts/
deploy-testnet.ts` refuses to run without an explicit deployer secret and WASM path.

## Repository quality and remaining risks

This workspace has no Git metadata, so the minimum-10-meaningful-commits requirement cannot
be verified or created safely from here. Recommended progression is: contract hardening,
contract tests, event/indexer wiring, frontend states, frontend tests, CI, deployment scripts,
Testnet deployment, verification evidence, and documentation as separate commits.

Screenshots are not included because no browser capture artifact exists in the workspace;
add desktop/tablet/mobile captures to `docs/screenshots/` for the release submission.
