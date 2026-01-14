import * as StellarSdk from '@stellar/stellar-sdk';

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET';
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

// USDC Configuration
export const USDC_ASSET_CODE = process.env.NEXT_PUBLIC_USDC_ASSET_CODE || 'USDC';
export const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

// Contract IDs
export const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || '';
export const NGO_CONTRACT_ID = process.env.NEXT_PUBLIC_NGO_CONTRACT_ID || '';
export const BENEFICIARY_CONTRACT_ID = process.env.NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID || '';
export const MERCHANT_CONTRACT_ID = process.env.NEXT_PUBLIC_MERCHANT_CONTRACT_ID || '';

// Network passphrase
export const NETWORK_PASSPHRASE = NETWORK === 'TESTNET' 
  ? StellarSdk.Networks.TESTNET 
  : StellarSdk.Networks.PUBLIC;

// Create Horizon server instance
export const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

// Create USDC Asset
export const USDC_ASSET = new StellarSdk.Asset(USDC_ASSET_CODE, USDC_ISSUER);

// Helper to format Stellar address
export function formatAddress(address: string, length: number = 8): string {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Helper to format USDC amount (7 decimals)
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

// Helper to convert to stroops (7 decimals for Stellar assets)
export function toStroops(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num * 10_000_000).toFixed(0);
}

// Helper to convert from stroops
export function fromStroops(stroops: string | number): string {
  const num = typeof stroops === 'string' ? parseInt(stroops) : stroops;
  return (num / 10_000_000).toFixed(7);
}

// Get account balances
export async function getAccountBalances(publicKey: string): Promise<StellarSdk.Horizon.HorizonApi.BalanceLine[]> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error loading account:', error);
    return [];
  }
}

// Get USDC balance specifically
export async function getUSDCBalance(publicKey: string): Promise<string> {
  try {
    const balances = await getAccountBalances(publicKey);
    const usdcBalance = balances.find(
      (b): b is StellarSdk.Horizon.HorizonApi.BalanceLineAsset => 
        'asset_code' in b && 
        b.asset_code === USDC_ASSET_CODE && 
        b.asset_issuer === USDC_ISSUER
    );
    return usdcBalance?.balance || '0';
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}

// Check if account exists
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await horizonServer.loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

// Check if account has USDC trustline
export async function hasUSDCTrustline(publicKey: string): Promise<boolean> {
  try {
    const balances = await getAccountBalances(publicKey);
    return balances.some(
      (b): b is StellarSdk.Horizon.HorizonApi.BalanceLineAsset => 
        'asset_code' in b && 
        b.asset_code === USDC_ASSET_CODE && 
        b.asset_issuer === USDC_ISSUER
    );
  } catch {
    return false;
  }
}
