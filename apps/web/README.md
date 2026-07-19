# Web application (apps/web)

Next.js App Router frontend for the RWA application.

- **Privy** identity (EVM funding wallet + optional Stellar via Freighter)
- **@lumixprotocol/note-vault** for browser-side note generation, encryption, and recovery
- Pages: `/` `/login` `/dashboard` `/vault` `/deposit` `/restore` `/withdraw` `/activity`

## Run locally

```bash
npm install
npm run dev                  # http://localhost:3000
```

## Security
- Notes are generated and encrypted in the browser; only ciphertext + wrapped keys
  reach the backend.
- The decrypted vault lives in memory; IndexedDB stores ONLY the encrypted envelope.
- No plaintext note secrets in localStorage (`ALLOW_PLAINTEXT_NOTE_CACHE=false`).
- Deposits unlock only after the vault backup is verified.
