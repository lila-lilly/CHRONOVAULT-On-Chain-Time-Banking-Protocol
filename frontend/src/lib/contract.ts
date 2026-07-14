import { Client as TimeBankClient, networks } from './time_bank/src/index';
import { useChronoStore } from './store';

export const TIME_BANK_CONTRACT_ID = networks.testnet.contractId;
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
export async function signAndSubmit(txFn: () => Promise<any>): Promise<string> {
  const { walletKit, pubKey } = useChronoStore.getState();
  if (!walletKit || !pubKey) throw new Error("Wallet not connected");

  // Build the transaction
  const tx = await txFn();

  // Prompt the wallet to sign and send the transaction
  const result = await tx.signAndSend({
    signTransaction: async (xdr: string, opts: any) => {
      const response = await walletKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        network: 'TESTNET',
      });
      // The wallet kit signTransaction returns `{ signedTxXdr }` or just the string depending on version.
      return (response as any).signedTxXdr || response;
    }
  });

  return result.hash || result.id || 'unknown';
}

