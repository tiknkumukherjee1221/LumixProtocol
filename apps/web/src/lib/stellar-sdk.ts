import {
  Asset,
  Horizon,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  HORIZON_TESTNET_URL,
  STELLAR_TESTNET_PASSPHRASE,
} from "./stellar-wallet";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

export async function fetchXlmBalance(address: string): Promise<string> {
  const response = await fetch(`${HORIZON_TESTNET_URL}/accounts/${encodeURIComponent(address)}`);
  if (response.status === 404) return "0";
  if (!response.ok) throw new Error(`Horizon balance request failed (${response.status})`);

  const account = (await response.json()) as {
    balances?: Array<{ asset_type: string; balance: string }>;
  };
  return account.balances?.find((balance) => balance.asset_type === "native")?.balance ?? "0";
}

export async function buildPaymentXdr(from: string, to: string, amount: string): Promise<string> {
  const account = await server.loadAccount(from);
  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: to,
        asset: Asset.native(),
        amount,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

export async function submitSignedTx(signedXdr: string): Promise<{ hash: string }> {
  const transaction = TransactionBuilder.fromXDR(signedXdr, STELLAR_TESTNET_PASSPHRASE);
  try {
    const result = await server.submitTransaction(transaction);
    return { hash: result.hash };
  } catch (error) {
    const horizonError = error as {
      response?: { data?: { title?: string; detail?: string; extras?: { result_codes?: unknown } } };
    };
    const data = horizonError.response?.data;
    const resultCodes = data?.extras?.result_codes;
    const message = data?.detail ?? data?.title ?? (resultCodes ? JSON.stringify(resultCodes) : undefined);
    throw new Error(message ?? (error instanceof Error ? error.message : "Horizon rejected the transaction"));
  }
}
