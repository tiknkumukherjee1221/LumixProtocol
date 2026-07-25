# Stellar Wallet Evidence and Contract Mapping

This file is intentionally a compact submission/reviewer checklist. Include the
repository root (especially `frontend/`, `contracts/stellar/shielded_pool/`, and
this document) when submitting the project for review.

## Required wallet capabilities

| Criterion | Implementation evidence |
|---|---|
| Wallet library | `frontend/package.json` declares `@stellar/freighter-api`; the implementation imports it in `frontend/lib/freighter-withdraw.ts`. |
| Visible connect flow | `frontend/components/stellar-wallet-button.tsx` renders **Connect Freighter** in the authenticated header; `frontend/app/(app)/move/page.tsx` also gates the Withdraw action behind that button. |
| Permission | `connectFreighter()` calls Freighter `requestAccess()` (the current API's permission request equivalent). |
| Address retrieval | `connectFreighter()` calls `getAddress()` and returns the selected public Stellar address. |
| Network permission/safety | `getNetworkDetails()` must equal `Networks.TESTNET` before the address is accepted. |
| Transaction signing | `freighterWithdraw()` calls `signTransaction()` with the prepared Soroban XDR, Testnet passphrase, and active account address. |
| Transaction broadcast | The signed XDR is parsed by `TransactionBuilder.fromXDR()` and submitted with Soroban RPC `sendTransaction()`. |

## Contract/frontend function match

The canonical Soroban method is:

```rust
shielded_pool::withdraw(env, to: Address, proof_bytes: Bytes, pub_signals_bytes: Bytes)
```

The frontend builds exactly this call:

```ts
new Contract(pool).call(
  "withdraw",
  Address.fromString(recipient).toScVal(),
  bytesScVal(proofHex),
  bytesScVal(publicHex),
)
```

`to` is the address returned by Freighter. The contract calls `to.require_auth()`;
therefore the browser requests the user's signature for that exact prepared
transaction before it is submitted. The client also compares `getAddress()` to
the proof-bound `recipient`, preventing a transaction from being signed with a
different active account.
