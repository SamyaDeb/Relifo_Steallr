# Freighter Wallet Integration for Relifo

## Overview
Relifo uses **Freighter Wallet** for Stellar blockchain integration, allowing donors to connect their existing Stellar wallets and transfer **native USDC** directly to relief campaigns.

---

## Why Freighter Wallet?

✅ **Native Stellar Support** - Built specifically for Stellar blockchain  
✅ **Browser Extension** - Works with Chrome, Firefox, Edge, Brave  
✅ **USDC Support** - Full support for Stellar USDC asset  
✅ **User Owned** - Donors control their private keys  
✅ **No Custody** - Relifo never holds donor funds  
✅ **Production Ready** - Used by major Stellar dApps  

---

## Donor Flow

### 1. Connect Wallet
```
User clicks "Connect Wallet" button
  ↓
Check if Freighter extension installed
  ↓
Request connection permission from Freighter
  ↓
Get user's public key (Stellar address)
  ↓
Display connected address: G7X8...9KL2
```

### 2. Check USDC Balance
```
Query Stellar Horizon API
  ↓
Get account balances
  ↓
Find USDC balance (Asset: USDC, Issuer: Circle)
  ↓
Display: "100.00 USDC available"
```

### 3. Add USDC (If Needed)
**For Testnet:**
- Show "Add USDC" button
- Link to Stellar USDC testnet faucet
- User gets free testnet USDC instantly

**For Mainnet:**
- Show "Add USDC" button with instructions:
  - Buy USDC from exchanges (Coinbase, Binance, Kraken)
  - Transfer USDC to Freighter wallet
  - Or swap XLM → USDC on Stellar DEX

### 4. Donate USDC
```
User enters donation amount
  ↓
Frontend builds payment transaction
  ↓
Freighter prompts user to sign transaction
  ↓
User approves in Freighter extension
  ↓
Transaction submitted to Stellar network
  ↓
USDC transferred: Donor → Campaign Vault
  ↓
Show success message with transaction hash
```

---

## Technical Implementation

### Installation
```bash
npm install @stellar/freighter-api stellar-sdk
```

### Connect Wallet
```typescript
import { isConnected, getPublicKey } from '@stellar/freighter-api';

async function connectWallet() {
  // Check if Freighter is installed
  const connected = await isConnected();
  if (!connected) {
    alert('Please install Freighter wallet extension');
    window.open('https://www.freighter.app/', '_blank');
    return null;
  }

  // Get user's public key
  const publicKey = await getPublicKey();
  return publicKey;
}
```

### Get USDC Balance
```typescript
import { Server } from 'stellar-sdk';

const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'; // Testnet
const server = new Server('https://horizon-testnet.stellar.org');

async function getUSDCBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    
    const usdcBalance = account.balances.find(
      balance => 
        balance.asset_type !== 'native' &&
        balance.asset_code === 'USDC' &&
        balance.asset_issuer === USDC_ISSUER
    );

    return usdcBalance ? usdcBalance.balance : '0';
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return '0';
  }
}
```

### Transfer USDC to Campaign
```typescript
import { 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Networks, 
  BASE_FEE 
} from 'stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

async function donateUSDC(
  donorPublicKey: string,
  campaignVaultAddress: string,
  amount: string
) {
  const server = new Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(donorPublicKey);

  // Build payment transaction
  const usdcAsset = new Asset('USDC', USDC_ISSUER);
  
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      Operation.payment({
        destination: campaignVaultAddress,
        asset: usdcAsset,
        amount: amount
      })
    )
    .setTimeout(30)
    .build();

  // Sign with Freighter
  const signedXDR = await signTransaction(
    transaction.toXDR(),
    'TESTNET'
  );

  // Submit transaction
  const signedTx = TransactionBuilder.fromXDR(
    signedXDR,
    Networks.TESTNET
  );
  
  const result = await server.submitTransaction(signedTx);
  return result.hash;
}
```

---

## React Hook Example

```typescript
// hooks/useWallet.ts
import { useState, useEffect } from 'react';
import { isConnected, getPublicKey } from '@stellar/freighter-api';

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');

  useEffect(() => {
    checkFreighter();
  }, []);

  async function checkFreighter() {
    const connected = await isConnected();
    setIsFreighterInstalled(connected);
  }

  async function connect() {
    try {
      const pk = await getPublicKey();
      setPublicKey(pk);
      await refreshBalance(pk);
      return pk;
    } catch (error) {
      console.error('Connection failed:', error);
      return null;
    }
  }

  async function disconnect() {
    setPublicKey(null);
    setUsdcBalance('0');
  }

  async function refreshBalance(pk?: string) {
    const key = pk || publicKey;
    if (!key) return;
    
    const balance = await getUSDCBalance(key);
    setUsdcBalance(balance);
  }

  return {
    publicKey,
    isFreighterInstalled,
    usdcBalance,
    connect,
    disconnect,
    refreshBalance
  };
}
```

---

## Component Example

```typescript
// components/donor/DonorWallet.tsx
import { useWallet } from '@/hooks/useWallet';

export function DonorWallet() {
  const { 
    publicKey, 
    isFreighterInstalled, 
    usdcBalance, 
    connect, 
    disconnect 
  } = useWallet();

  if (!isFreighterInstalled) {
    return (
      <div className="wallet-error">
        <p>Freighter wallet not detected</p>
        <a 
          href="https://www.freighter.app/" 
          target="_blank"
          className="install-button"
        >
          Install Freighter
        </a>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <button onClick={connect} className="connect-button">
        Connect Freighter Wallet
      </button>
    );
  }

  return (
    <div className="wallet-connected">
      <div className="wallet-address">
        <span>Connected:</span>
        <code>{publicKey.slice(0, 8)}...{publicKey.slice(-8)}</code>
      </div>
      
      <div className="usdc-balance">
        <span>USDC Balance:</span>
        <strong>{parseFloat(usdcBalance).toFixed(2)} USDC</strong>
      </div>

      {parseFloat(usdcBalance) === 0 && (
        <a 
          href="https://laboratory.stellar.org/#account-creator?network=test"
          target="_blank"
          className="add-usdc-button"
        >
          Add Testnet USDC
        </a>
      )}

      <button onClick={disconnect} className="disconnect-button">
        Disconnect
      </button>
    </div>
  );
}
```

---

## Testnet vs Mainnet

### Testnet Configuration
```typescript
const NETWORK = 'TESTNET';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_FAUCET = 'https://laboratory.stellar.org/#account-creator?network=test';
```

### Mainnet Configuration
```typescript
const NETWORK = 'PUBLIC';
const HORIZON_URL = 'https://horizon.stellar.org';
const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'; // Circle
const USDC_EXCHANGES = [
  'Coinbase',
  'Binance',
  'Kraken',
  'StellarX'
];
```

---

## Security Best Practices

1. **Never Store Private Keys** - Freighter manages keys, not your app
2. **Validate Transactions** - Show user exactly what they're signing
3. **Check Balance First** - Prevent insufficient funds errors
4. **Use HTTPS Only** - Freighter requires secure connections
5. **Handle Errors Gracefully** - User may reject transaction
6. **Rate Limit Requests** - Don't spam Horizon API
7. **Verify Contract Addresses** - Ensure vault address is correct

---

## Error Handling

```typescript
try {
  const txHash = await donateUSDC(publicKey, vaultAddress, amount);
  showSuccess(`Donation successful! TX: ${txHash}`);
} catch (error) {
  if (error.message.includes('User declined')) {
    showError('Transaction cancelled by user');
  } else if (error.message.includes('insufficient balance')) {
    showError('Insufficient USDC balance');
  } else {
    showError('Transaction failed. Please try again.');
  }
}
```

---

## Testing on Testnet

### 1. Install Freighter
- Go to https://www.freighter.app/
- Install browser extension
- Create or import testnet account

### 2. Fund Testnet Account
```bash
# Get XLM from Friendbot
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# Or use Stellar Laboratory:
# https://laboratory.stellar.org/#account-creator?network=test
```

### 3. Add USDC Trustline
```typescript
// Your app should handle this automatically
// Or use Stellar Laboratory to add USDC asset trustline
```

### 4. Get Testnet USDC
- Use testnet USDC faucet
- Or ask in Stellar Discord #testnet channel

### 5. Test Donation Flow
- Connect Freighter wallet
- Check USDC balance displays
- Enter donation amount
- Sign transaction in Freighter
- Verify transaction on Stellar Explorer

---

## Production Checklist

- [ ] Freighter integration tested on testnet
- [ ] Wallet connection flow works
- [ ] USDC balance displays correctly
- [ ] Donation transactions succeed
- [ ] Transaction hashes displayed
- [ ] Error handling implemented
- [ ] Loading states for async operations
- [ ] Disconnect functionality works
- [ ] Mobile responsiveness tested
- [ ] Network switching (testnet/mainnet) supported
- [ ] Transaction confirmations shown
- [ ] Audit trail integrated with blockchain events

---

## Resources

- **Freighter Docs**: https://docs.freighter.app/
- **Stellar SDK**: https://stellar.github.io/js-stellar-sdk/
- **Horizon API**: https://developers.stellar.org/api/horizon
- **Testnet USDC Issuer**: https://stellar.expert/explorer/testnet/asset/USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
- **Mainnet USDC Issuer**: https://stellar.expert/explorer/public/asset/USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
