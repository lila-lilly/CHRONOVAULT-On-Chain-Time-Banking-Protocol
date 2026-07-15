import { Client as TimeBankClient, networks } from './time_bank/src/index';
import { useChronoStore } from './store';

export const TIME_BANK_CONTRACT_ID = import.meta.env.VITE_TIME_BANK_ID || "CDTHOHTPANEA5IODFI2C7TXGAPDLURCBZNB7MEOITBLXJNY2VAM2XAZO";
export const COMMUNITY_LEDGER_CONTRACT_ID = import.meta.env.VITE_COMMUNITY_LEDGER_ID || "CASUHYOA2PPKPIBAL7VI24Q76XOTXCLGTWYPYL3J7N5L4HDN6AC7QBDE";
export const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;

export const timeBankClient = new TimeBankClient({
  networkPassphrase: NETWORK_PASSPHRASE,
  contractId: TIME_BANK_CONTRACT_ID,
  rpcUrl: 'https://soroban-testnet.stellar.org',
});

/**
 * Sign and send a transaction using the connected Freighter wallet.
 * Returns the transaction hash if successful.
 */
export async function signAndSubmit(txFn: () => Promise<unknown>): Promise<string> {
  const { walletKit, pubKey } = useChronoStore.getState();
  if (!walletKit || !pubKey) throw new Error("Wallet not connected");

  // Build the transaction
  const tx = (await txFn()) as { signAndSend: (opts: unknown) => Promise<unknown> };

  // Prompt the wallet to sign and send the transaction
  const result = await tx.signAndSend({
    signTransaction: async (xdr: string) => {
      const response = await walletKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      // The wallet kit signTransaction returns `{ signedTxXdr }` or just the string depending on version.
      return (response as { signedTxXdr?: string }).signedTxXdr || response;
    }
  }) as { hash?: string; id?: string };

  return result.hash || result.id || 'unknown';
}

