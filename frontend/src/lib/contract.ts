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
 * Sign and send an AssembledTransaction using the connected Freighter wallet.
 * Returns the transaction hash if successful.
 */
export async function signAndSubmit(txFn: () => Promise<unknown>): Promise<string> {
  const { walletKit, pubKey } = useChronoStore.getState();
  if (!walletKit || !pubKey) throw new Error("Wallet not connected");

  // Build the assembled transaction (simulation happens inside txFn)
  const assembled = (await txFn()) as {
    sign: (opts: {
      signTransaction: (xdr: string) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
    }) => Promise<void>;
    send: () => Promise<unknown>;
  };

  // Sign using the Freighter wallet
  await assembled.sign({
    signTransaction: async (xdr: string) => {
      const response = await walletKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      // Freighter returns { signedTxXdr, signerAddress? }
      if (typeof response === 'object' && response !== null && 'signedTxXdr' in response) {
        return response as { signedTxXdr: string; signerAddress?: string };
      }
      return { signedTxXdr: response as unknown as string };
    },
  });

  // Submit the signed transaction to the network
  const result = await assembled.send();

  // Extract transaction hash from the response
  const res = result as { hash?: string; sendTransactionResponse?: { hash?: string } };
  const hash = res?.hash || res?.sendTransactionResponse?.hash || 'unknown';

  return hash;
}
