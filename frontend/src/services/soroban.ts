import * as StellarSdk from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { 
  SOROBAN_RPC_URL, 
  NETWORK_PASSPHRASE,
  VAULT_CONTRACT_ID,
  NGO_CONTRACT_ID,
  BENEFICIARY_CONTRACT_ID,
  MERCHANT_CONTRACT_ID 
} from '@/lib/stellar';

// Create Soroban RPC client
const sorobanServer = new rpc.Server(SOROBAN_RPC_URL);

// Contract IDs export
export const CONTRACT_IDS = {
  VAULT: VAULT_CONTRACT_ID,
  NGO: NGO_CONTRACT_ID,
  BENEFICIARY: BENEFICIARY_CONTRACT_ID,
  MERCHANT: MERCHANT_CONTRACT_ID,
} as const;

// Helper to create contract instance
export function getContract(contractId: string): StellarSdk.Contract {
  return new StellarSdk.Contract(contractId);
}

// Build a contract call transaction
export async function buildContractCall(
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  sourcePublicKey: string
): Promise<StellarSdk.Transaction> {
  const contract = getContract(contractId);
  const account = await sorobanServer.getAccount(sourcePublicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate to get resource requirements
  const simulated = await sorobanServer.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Prepare transaction with simulation results
  const prepared = rpc.assembleTransaction(tx, simulated);
  return prepared.build();
}

// Sign and submit a contract transaction
export async function signAndSubmitTransaction(
  tx: StellarSdk.Transaction,
  sourcePublicKey: string
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  // Sign with Freighter
  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourcePublicKey,
  });

  if (signResult.error || !signResult.signedTxXdr) {
    throw new Error('Failed to sign transaction');
  }

  // Parse signed transaction
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  ) as StellarSdk.Transaction;

  // Submit transaction
  const result = await sorobanServer.sendTransaction(signedTx);

  if (result.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${result.errorResult}`);
  }

  // Wait for transaction to complete
  const hash = result.hash;
  let response = await sorobanServer.getTransaction(hash);

  // Poll for transaction completion
  while (response.status === 'NOT_FOUND') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await sorobanServer.getTransaction(hash);
  }

  if (response.status === 'FAILED') {
    throw new Error('Transaction failed');
  }

  return response as rpc.Api.GetSuccessfulTransactionResponse;
}

// Call contract function (read-only, no signing required)
export async function callContractReadOnly(
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  sourcePublicKey: string
): Promise<StellarSdk.xdr.ScVal | undefined> {
  const contract = getContract(contractId);
  const account = await sorobanServer.getAccount(sourcePublicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  if (rpc.Api.isSimulationSuccess(simulated)) {
    return simulated.result?.retval;
  }

  return undefined;
}

// Get transaction status
export async function getTransactionStatus(
  hash: string
): Promise<rpc.Api.GetTransactionResponse> {
  return sorobanServer.getTransaction(hash);
}

// Query contract data from ledger
export async function queryContractData(
  contractId: string
): Promise<rpc.Api.LedgerEntryResult | null> {
  const contract = new StellarSdk.Contract(contractId);
  const ledgerKey = contract.getFootprint();
  
  try {
    const entries = await sorobanServer.getLedgerEntries(ledgerKey);
    return entries.entries?.[0] || null;
  } catch {
    return null;
  }
}

// Helper to convert native values to ScVal
export const scVal = {
  string: (value: string) => StellarSdk.nativeToScVal(value, { type: 'string' }),
  symbol: (value: string) => StellarSdk.nativeToScVal(value, { type: 'symbol' }),
  i128: (value: bigint | number) => StellarSdk.nativeToScVal(BigInt(value), { type: 'i128' }),
  u64: (value: bigint | number) => StellarSdk.nativeToScVal(BigInt(value), { type: 'u64' }),
  bool: (value: boolean) => StellarSdk.nativeToScVal(value, { type: 'bool' }),
  address: (value: string) => StellarSdk.Address.fromString(value).toScVal(),
  vec: (values: StellarSdk.xdr.ScVal[]) => StellarSdk.xdr.ScVal.scvVec(values),
  map: (entries: [StellarSdk.xdr.ScVal, StellarSdk.xdr.ScVal][]) => {
    const mapEntries = entries.map(([key, val]) => 
      new StellarSdk.xdr.ScMapEntry({ key, val })
    );
    return StellarSdk.xdr.ScVal.scvMap(mapEntries);
  },
};

// Helper to convert ScVal to native values
export function scValToNative(scVal: StellarSdk.xdr.ScVal): unknown {
  return StellarSdk.scValToNative(scVal);
}
