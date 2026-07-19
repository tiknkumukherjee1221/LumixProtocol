"use client";

import { FormEvent, useEffect, useState } from "react";
import { connectWallet, detectFreighter, signTx } from "@/lib/stellar-wallet";
import { useWallet } from "@/hooks/use-stellar-wallet";

export function StellarWalletPanel() {
  const wallet = useWallet();
  const [freighterDetected, setFreighterDetected] = useState<boolean | null>(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    void detectFreighter().then(setFreighterDetected);
  }, []);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    try {
      const result = await wallet.sendXlm(destination.trim(), amount.trim());
      setFeedback({ type: "success", message: result.hash });
      setDestination("");
      setAmount("");
      await wallet.refreshBalance();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Transaction failed" });
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-violet-400">Stellar Testnet</p>
        <h1 className="mt-2 text-2xl font-semibold">Freighter Wallet</h1>
        <p className="mt-2 text-sm text-neutral-400">Connect, view your XLM balance, and send testnet XLM.</p>
      </div>

      {freighterDetected === false && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/50 p-4 text-sm text-amber-200">
          Freighter was not detected. <a className="font-semibold underline" href="https://freighter.app" target="_blank" rel="noreferrer">Install Freighter</a> to continue.
        </div>
      )}

      {wallet.error && <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-200">{wallet.error}</div>}

      {!wallet.isConnected ? (
        <button disabled={wallet.isLoading || freighterDetected === false} onClick={() => void wallet.connect()} className="rounded-lg bg-violet-600 px-4 py-3 font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
          {wallet.isLoading ? "Connecting…" : "Connect Wallet"}
        </button>
      ) : (
        <>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs uppercase tracking-wide text-neutral-500">Connected address</p><p className="mt-1 break-all font-mono text-sm text-violet-300">{wallet.address}</p></div>
              <button onClick={wallet.disconnect} className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">Disconnect</button>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-neutral-500">XLM balance</p><p className="mt-1 text-3xl font-semibold">{wallet.balance === "0" ? "0 XLM (account not funded)" : `${wallet.balance ?? "—"} XLM`}</p></div><button disabled={wallet.isLoading} onClick={() => void wallet.refreshBalance()} className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50">{wallet.isLoading ? "Refreshing…" : "Refresh Balance"}</button></div>
          </div>

          <form onSubmit={(event) => void handleSend(event)} className="space-y-4 border-t border-neutral-800 pt-6">
            <h2 className="text-lg font-medium">Send XLM</h2>
            <label className="block text-sm text-neutral-300">Destination address<input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="G…" className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-sm outline-none focus:border-violet-500" /></label>
            <label className="block text-sm text-neutral-300">Amount (XLM)<input required min="0.0000001" step="any" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1.5" className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-violet-500" /></label>
            <button disabled={wallet.isLoading} type="submit" className="rounded-lg bg-emerald-600 px-4 py-3 font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">{wallet.isLoading ? "Processing…" : "Send XLM"}</button>
          </form>
        </>
      )}

      {feedback?.type === "success" && <div className="rounded-lg border border-emerald-700 bg-emerald-950/50 p-4 text-sm text-emerald-200">Transaction sent! Hash: <a className="break-all underline" href={`https://stellar.expert/explorer/testnet/tx/${feedback.message}`} target="_blank" rel="noreferrer">{feedback.message}</a></div>}
      {feedback?.type === "error" && <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-200">{feedback.message}</div>}
      <p className="text-xs text-neutral-500">Network: Stellar Testnet · Testnet funds only</p>
    </section>
  );
}
