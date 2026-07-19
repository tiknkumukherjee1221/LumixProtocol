"use client";

import { StellarWalletPanel } from "@/components/wallet/stellar-wallet-panel";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <title>Stellar Wallet — Freighter Integration</title>
      <StellarWalletPanel />
    </div>
  );
}
