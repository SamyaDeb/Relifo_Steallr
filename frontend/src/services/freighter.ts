import { 
  isConnected, 
  isAllowed, 
  getAddress, 
  signTransaction,
  requestAccess
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { 
  horizonServer, 
  USDC_ASSET, 
  NETWORK_PASSPHRASE, 
  NETWORK,
  getUSDCBalance as getUSDCBalanceFromStellar 
} from '@/lib/stellar';

// Check if Freighter extension is installed
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected ?? false;
  } catch {
    return false;
  }
}

// Check if app is allowed to connect
export async function isFreighterAllowed(): Promise<boolean> {
  try {
    const result = await isAllowed();
    return result.isAllowed ?? false;
  } catch {
    return false;
  }
}

// Connect to Freighter wallet
export async function connectFreighterWallet(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
  }

  // Request permission
  await requestAccess();

  // Get public key using getAddress
  const result = await getAddress();
  if (result.error || !result.address) {
    throw new Error('Failed to get public key from Freighter');
  }

  return result.address;
}

// Get USDC balance from connected wallet
export async function getUSDCBalance(publicKey: string): Promise<string> {
  return getUSDCBalanceFromStellar(publicKey);
}

// Build and sign a USDC payment transaction
export async function transferUSDC(
  fromPublicKey: string,
  toAddress: string,
  amount: string
): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
  // Load sender account
  const account = await horizonServer.loadAccount(fromPublicKey);

  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset: USDC_ASSET,
        amount: amount,
      })
    )
    .setTimeout(30)
    .build();

  // Sign with Freighter
  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: fromPublicKey,
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
  const result = await horizonServer.submitTransaction(signedTx);
  return result;
}

// Build and sign a trustline transaction for USDC
export async function addUSDCTrustline(
  publicKey: string
): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
  // Load account
  const account = await horizonServer.loadAccount(publicKey);

  // Build trustline transaction
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: USDC_ASSET,
      })
    )
    .setTimeout(30)
    .build();

  // Sign with Freighter
  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  if (signResult.error || !signResult.signedTxXdr) {
    throw new Error('Failed to sign trustline transaction');
  }

  // Parse signed transaction
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  ) as StellarSdk.Transaction;

  // Submit transaction
  const result = await horizonServer.submitTransaction(signedTx);
  return result;
}

// Get current network from Freighter
export function getNetworkName(): string {
  return NETWORK === 'TESTNET' ? 'Stellar Testnet' : 'Stellar Mainnet';
}

// Get testnet friendbot URL
export function getFriendbotUrl(publicKey: string): string {
  return `https://friendbot.stellar.org?addr=${publicKey}`;
}

// Fund account with testnet XLM via Friendbot
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(getFriendbotUrl(publicKey));
    return response.ok;
  } catch {
    return false;
  }
}
