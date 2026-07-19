"use client";

import { useCallback, useEffect, useState } from "react";
import { connectWallet, getWalletAddress, signTx } from "@/lib/stellar-wallet";
import {
  buildPaymentXdr,
  fetchXlmBalance,
  submitSignedTx,
} from "@/lib/stellar-sdk";

type WalletState = {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const refreshBalance = useCallback(async () => {
    if (!state.address) return;
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const balance = await fetchXlmBalance(state.address);
      setState((current) => ({ ...current, balance, isLoading: false }));
    } catch (error) {
      setState((current) => ({ ...current, isLoading: false, error: getErrorMessage(error) }));
    }
  }, [state.address]);

  const connect = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const address = await connectWallet();
      const balance = await fetchXlmBalance(address);
      setState({ address, balance, isConnected: true, isLoading: false, error: null });
    } catch (error) {
      setState((current) => ({ ...current, isLoading: false, error: getErrorMessage(error) }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, balance: null, isConnected: false, isLoading: false, error: null });
  }, []);

  const sendXlm = useCallback(async (to: string, amount: string): Promise<{ hash: string }> => {
    if (!state.address) throw new Error("Connect your wallet before sending XLM");
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const unsignedXdr = await buildPaymentXdr(state.address, to, amount);
      const signedXdr = await signTx(unsignedXdr);
      const result = await submitSignedTx(signedXdr);
      setState((current) => ({ ...current, isLoading: false }));
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      setState((current) => ({ ...current, isLoading: false, error: message }));
      throw new Error(message);
    }
  }, [state.address]);

  useEffect(() => {
    let active = true;
    async function restoreWallet() {
      try {
        const address = await getWalletAddress();
        if (!active || !address) return;
        const balance = await fetchXlmBalance(address);
        if (active) setState((current) => ({ ...current, address, balance, isConnected: true }));
      } catch (error) {
        if (active) setState((current) => ({ ...current, error: getErrorMessage(error) }));
      }
    }
    void restoreWallet();
    return () => { active = false; };
  }, []);

  return { ...state, connect, disconnect, refreshBalance, sendXlm };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
