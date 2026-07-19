import {
  getAddress,
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

export const STELLAR_TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

export async function detectFreighter(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string> {
  const allowed = await isAllowed();
  if (allowed.error) throw new Error(allowed.error.message ?? "Unable to check wallet permission");

  const result = allowed.isAllowed ? await getAddress() : await requestAccess();
  if (result.error) throw new Error(result.error.message ?? "Freighter access denied");
  if (!result.address) throw new Error("Freighter did not return a wallet address");
  return result.address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const allowed = await isAllowed();
    if (allowed.error || !allowed.isAllowed) return null;
    const result = await getAddress();
    return result.error || !result.address ? null : result.address;
  } catch {
    return null;
  }
}

export async function signTx(xdr: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
  });
  if (result.error) throw new Error(result.error.message ?? "Freighter signing failed");
  return result.signedTxXdr;
}
