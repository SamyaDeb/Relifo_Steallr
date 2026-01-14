# Relifo Smart Contracts - Deployment Guide

**Date**: January 14, 2026  
**Network**: Stellar Testnet  
**Status**: ✅ Phase 7.2 Complete - All contracts compiled to WASM

---

## ✅ Phase 7.2 COMPLETE: Build and Compile Contracts

All 4 contracts have been successfully compiled to WASM:

### Build Commands Used
```bash
# ReliefVault (default)
cargo build --release --target wasm32-unknown-unknown

# NGORegistry
cargo build --release --target wasm32-unknown-unknown --features ngo

# BeneficiaryRegistry  
cargo build --release --target wasm32-unknown-unknown --features beneficiary

# MerchantRegistry
cargo build --release --target wasm32-unknown-unknown --features merchant
```

### Build Results
✅ **All 4 contracts compiled successfully**
- WASM files generated in `target/wasm32-unknown-unknown/release/`
- File size: ~26KB per contract
- No compilation errors

---

## Phase 7.3: Deploy to Stellar Testnet

### Prerequisites

1. **Install Stellar CLI** (if not already installed):
```bash
cargo install --locked stellar-cli --features opt
```

2. **Create/Load Stellar Identity**:
```bash
# Generate new identity
stellar keys generate relifo-admin --network testnet

# Or import existing secret key
stellar keys add relifo-admin --secret-key S...

# Get your address
stellar keys address relifo-admin
```

3. **Fund Testnet Account**:
```bash
# Get test lumens from friendbot
ADMIN_ADDRESS=$(stellar keys address relifo-admin)
curl "https://friendbot.stellar.org?addr=$ADMIN_ADDRESS"
```

### Automated Deployment

We've created a deployment script that handles everything:

```bash
cd contracts
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. ✅ Build all 4 contracts
2. ✅ Deploy each contract to testnet
3. ✅ Save contract IDs to files
4. ✅ Generate `.env` file for frontend

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. ReliefVault
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/relifo_contracts.wasm \
  --source relifo-admin \
  --network testnet

# 2. NGORegistry (rebuild with feature first)
cargo build --release --target wasm32-unknown-unknown --features ngo
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/relifo_contracts.wasm \
  --source relifo-admin \
  --network testnet

# 3. BeneficiaryRegistry
cargo build --release --target wasm32-unknown-unknown --features beneficiary
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/relifo_contracts.wasm \
  --source relifo-admin \
  --network testnet

# 4. MerchantRegistry
cargo build --release --target wasm32-unknown-unknown --features merchant
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/relifo_contracts.wasm \
  --source relifo-admin \
  --network testnet
```

Each `deploy` command will output a Contract ID like:
```
CDABCD...XYZ123
```

**⚠️ SAVE THESE IDs - They cannot be recovered!**

---

## Contract Addresses (TO BE FILLED AFTER DEPLOYMENT)

After running the deployment script, your contract addresses will be saved to:

### `deployed/CONTRACT_ADDRESSES.txt`
```
# Relifo Contract Addresses - Stellar Testnet
# Generated: [DATE]

ADMIN_ADDRESS=[YOUR_STELLAR_ADDRESS]
VAULT_CONTRACT_ID=[VAULT_ID]
NGO_CONTRACT_ID=[NGO_ID]
BENEFICIARY_CONTRACT_ID=[BENEFICIARY_ID]
MERCHANT_CONTRACT_ID=[MERCHANT_ID]
```

### `deployed/contracts.env`
```env
NEXT_PUBLIC_VAULT_CONTRACT_ID=[VAULT_ID]
NEXT_PUBLIC_NGO_CONTRACT_ID=[NGO_ID]
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=[BENEFICIARY_ID]
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=[MERCHANT_ID]
NEXT_PUBLIC_ADMIN_ADDRESS=[ADMIN_ADDRESS]
```

---

## Phase 7.4: Initialize Contracts

After deployment, contracts need initialization:

### 1. Initialize ReliefVault
```bash
stellar contract invoke \
  --id $VAULT_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --usdc_contract GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

### 2. Initialize NGORegistry
```bash
stellar contract invoke \
  --id $NGO_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS
```

### 3. Initialize BeneficiaryRegistry
```bash
stellar contract invoke \
  --id $BENEFICIARY_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS
```

### 4. Initialize MerchantRegistry
```bash
stellar contract invoke \
  --id $MERCHANT_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS
```

---

## Phase 7.5: Update Frontend Configuration

1. **Copy environment variables**:
```bash
cp contracts/deployed/contracts.env frontend/.env.local
```

2. **Or manually update** `frontend/.env.local`:
```env
# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# USDC Configuration
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

# Contract IDs (from deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ID=[YOUR_VAULT_ID]
NEXT_PUBLIC_NGO_CONTRACT_ID=[YOUR_NGO_ID]
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=[YOUR_BENEFICIARY_ID]
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=[YOUR_MERCHANT_ID]
NEXT_PUBLIC_ADMIN_ADDRESS=[YOUR_ADMIN_ADDRESS]

# MongoDB
MONGODB_URI=[YOUR_MONGODB_URI]
```

3. **Test frontend connection**:
```bash
cd frontend
npm run dev
```

---

## Verification

### Check Deployment on Stellar Expert
Visit: https://stellar.expert/explorer/testnet/contract/[CONTRACT_ID]

Replace `[CONTRACT_ID]` with each of your deployed contract IDs.

### Test Contract Calls
```bash
# Test NGORegistry
stellar contract invoke \
  --id $NGO_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  get_ngo \
  --ngo_address $ADMIN_ADDRESS

# Test BeneficiaryRegistry
stellar contract invoke \
  --id $BENEFICIARY_CONTRACT_ID \
  --source relifo-admin \
  --network testnet \
  -- \
  is_approved \
  --beneficiary $SOME_ADDRESS
```

---

## Troubleshooting

### Error: "Account not found"
```bash
# Fund your account with friendbot
curl "https://friendbot.stellar.org?addr=$ADMIN_ADDRESS"
```

### Error: "Insufficient balance"
- Testnet accounts need XLM for transaction fees
- Each contract deployment costs ~0.5 XLM
- Make sure your account has at least 5 XLM

### Error: "Contract already deployed"
- You can invoke the existing contract
- Or deploy a new instance

### Error: "WASM file not found"
```bash
# Rebuild contracts
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

---

## Next Steps

After successful deployment:

1. ✅ Save all contract IDs
2. ✅ Initialize all contracts
3. ✅ Update frontend `.env.local`
4. ✅ Test frontend connection
5. ✅ Run end-to-end tests (Phase 7.5)
6. ✅ Create test campaigns and donations
7. ✅ Document for hackathon demo

---

## Contract Architecture

```
Relifo Smart Contracts
├── ReliefVault (Campaign & Fund Management)
│   ├── initialize()
│   ├── create_campaign()
│   ├── donate()
│   ├── allocate_funds()
│   └── authorize_spending()
│
├── NGORegistry (NGO Management)
│   ├── initialize()
│   ├── register_ngo()
│   ├── verify_ngo()
│   └── get_ngo()
│
├── BeneficiaryRegistry (Beneficiary Management)
│   ├── initialize()
│   ├── register_for_campaign()
│   ├── approve_beneficiary()
│   ├── set_category_limits()
│   └── enforce_category_spending()
│
└── MerchantRegistry (Merchant Management)
    ├── initialize()
    ├── register_merchant()
    ├── verify_merchant()
    └── get_merchant()
```

---

## Security Notes

### Testnet vs Mainnet

**Testnet** (Current):
- Use test USDC
- Free XLM from friendbot
- No real money
- Perfect for development

**Mainnet** (Production):
- Real USDC
- Real XLM costs
- Security audit required
- Higher stakes

### Key Management

⚠️ **NEVER COMMIT SECRET KEYS TO GIT**

- Store admin keys securely
- Use hardware wallets for mainnet
- Keep backup of secret keys
- Use different keys for test/production

---

## Resources

- **Stellar Testnet Explorer**: https://stellar.expert/explorer/testnet
- **Friendbot** (Free XLM): https://friendbot.stellar.org
- **Soroban Documentation**: https://soroban.stellar.org/docs
- **Stellar CLI Docs**: https://developers.stellar.org/docs/tools/developer-tools

---

**Status**: Ready for deployment once Stellar CLI is installed ✅
