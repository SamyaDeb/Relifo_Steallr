# Relifo Deployment Guide

**Deployment Date:** January 15, 2026  
**Network:** Stellar Testnet  
**Admin Address:** `GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT`

## 📦 Deployed Smart Contracts

### 1. ReliefVault Contract
**Contract ID:** `CASZUOUNIQK4X6QMFOE2D5VJQ7IITYYZCYLM3YW5ZHTXZ36UC7P6N4AZ`  
**Purpose:** Main vault for handling donations, allocations, and spending authorization  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CASZUOUNIQK4X6QMFOE2D5VJQ7IITYYZCYLM3YW5ZHTXZ36UC7P6N4AZ

**Functions:**
- `initialize(admin, usdc_token)` - Initialize contract ✅ DONE
- `donate(donor, campaign_id, amount)` - Accept donations
- `create_campaign(ngo, category, target, description)` - Create new campaign
- `allocate_to_beneficiary(campaign_id, beneficiary, amount, category_limits)` - Allocate funds
- `authorize_spending(beneficiary, merchant, amount, category)` - Authorize payment
- `execute_spending(beneficiary, merchant, amount, category)` - Execute payment

### 2. NGORegistry Contract
**Contract ID:** `CC5RCRQ3OZE5WIPRWJWMMJNJIYVNUIAECD7HPKBPJFNBJCZXSWTFU3QF`  
**Purpose:** Manage NGO registrations, verifications, and status  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CC5RCRQ3OZE5WIPRWJWMMJNJIYVNUIAECD7HPKBPJFNBJCZXSWTFU3QF

**Functions:**
- `initialize(admin)` - Initialize contract ✅ DONE
- `register_ngo(ngo, name, description)` - Register new NGO
- `verify_ngo(ngo_address)` - Admin verifies NGO
- `is_verified(ngo)` - Check verification status
- `get_all_ngos()` - Get all registered NGOs
- `get_pending_ngos()` - Get pending verifications

### 3. BeneficiaryRegistry Contract
**Contract ID:** `CBNVHYUZWK2SBD7KKP7V76JQXGD2SVIOUWQQ2HKWPUAQ42FAHUYYC7UG`  
**Purpose:** Manage beneficiary applications, approvals, and spending limits  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CBNVHYUZWK2SBD7KKP7V76JQXGD2SVIOUWQQ2HKWPUAQ42FAHUYYC7UG

**Functions:**
- `initialize(admin)` - Initialize contract ✅ DONE
- `register_for_campaign(beneficiary, campaign_id, details)` - Apply for aid
- `approve_beneficiary(beneficiary_address, campaign_id)` - Approve application
- `is_approved(beneficiary, campaign_id)` - Check approval status
- `get_category_balance(beneficiary, category)` - Check available balance
- `update_spending(beneficiary, category, amount)` - Update spent amount

### 4. MerchantRegistry Contract
**Contract ID:** `CBGZFHGLEOJGK42KGG2IZONWVK3OLYEYM5E56FUAB56H4XVAX3TMWKFP`  
**Purpose:** Manage merchant registrations, category approvals, and payments  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CBGZFHGLEOJGK42KGG2IZONWVK3OLYEYM5E56FUAB56H4XVAX3TMWKFP

**Functions:**
- `initialize(admin)` - Initialize contract ✅ DONE
- `register_merchant(merchant, name, category)` - Register new merchant
- `approve_merchant(merchant_address)` - Approve merchant
- `approve_for_category(merchant, category)` - Approve for category
- `is_approved_for_category(merchant, category)` - Check category approval
- `get_merchants_by_category(category)` - Get merchants by category

## 🔧 Configuration

### Environment Variables

**Frontend (.env.production & .env.local):**
```env
# Smart Contract Addresses
NEXT_PUBLIC_VAULT_CONTRACT_ID=CASZUOUNIQK4X6QMFOE2D5VJQ7IITYYZCYLM3YW5ZHTXZ36UC7P6N4AZ
NEXT_PUBLIC_NGO_CONTRACT_ID=CC5RCRQ3OZE5WIPRWJWMMJNJIYVNUIAECD7HPKBPJFNBJCZXSWTFU3QF
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=CBNVHYUZWK2SBD7KKP7V76JQXGD2SVIOUWQQ2HKWPUAQ42FAHUYYC7UG
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=CBGZFHGLEOJGK42KGG2IZONWVK3OLYEYM5E56FUAB56H4XVAX3TMWKFP

# Admin Address
NEXT_PUBLIC_ADMIN_ADDRESS=GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT

# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# USDC Configuration (Testnet)
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/relifo
NODE_ENV=development
```

## 🚀 Deployment Steps (Reference)

### 1. Build Contracts
```bash
cd contracts
rustup target add wasm32v1-none
stellar contract build
stellar contract build --features ngo
stellar contract build --features beneficiary
stellar contract build --features merchant
```

### 2. Deploy Contracts
```bash
# Add admin key
SOROBAN_SECRET_KEY=<YOUR_SECRET_KEY> stellar keys add admin --secret-key

# Fund account
curl -X POST "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"

# Deploy each contract
stellar contract deploy --wasm target/wasm32v1-none/release/relifo_contracts.wasm --source admin --network testnet
```

### 3. Initialize Contracts
```bash
# ReliefVault
stellar contract invoke --id <VAULT_ID> --source admin --network testnet -- initialize --admin <ADMIN_ADDRESS> --usdc_token <USDC_ISSUER>

# NGORegistry
stellar contract invoke --id <NGO_ID> --source admin --network testnet -- initialize --admin <ADMIN_ADDRESS>

# BeneficiaryRegistry
stellar contract invoke --id <BENEFICIARY_ID> --source admin --network testnet -- initialize --admin <ADMIN_ADDRESS>

# MerchantRegistry
stellar contract invoke --id <MERCHANT_ID> --source admin --network testnet -- initialize --admin <ADMIN_ADDRESS>
```

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐│
│  │   Donor    │  │    NGO     │  │ Beneficiary│  │Merchant││
│  │ Dashboard  │  │ Dashboard  │  │ Dashboard  │  │Dashboard││
│  └────────────┘  └────────────┘  └────────────┘  └────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼──────┐     ┌────────▼────────┐
        │   Backend    │     │  Stellar Smart  │
        │  (Express)   │     │   Contracts     │
        │              │     │  (Soroban Rust) │
        └───────┬──────┘     └────────┬────────┘
                │                     │
        ┌───────▼──────┐     ┌────────▼────────┐
        │   MongoDB    │     │ Stellar Testnet │
        │   Database   │     │   Blockchain    │
        └──────────────┘     └─────────────────┘
```

## 🔐 Security Considerations

1. **Admin Access:** Only admin can verify NGOs, approve merchants, and manage system
2. **Contract Initialization:** All contracts initialized with admin address
3. **Private Key Security:** Admin private key stored securely (not in git)
4. **Testnet Environment:** Currently deployed on testnet for testing
5. **Category Limits:** Spending enforced by category limits
6. **Approval Workflow:** Multi-step approval for NGOs, beneficiaries, and merchants

## 🌐 Network Information

**Network:** Stellar Testnet  
**Horizon API:** https://horizon-testnet.stellar.org  
**Soroban RPC:** https://soroban-testnet.stellar.org  
**Friendbot:** https://friendbot.stellar.org (for funding test accounts)  
**Stellar Expert:** https://stellar.expert/explorer/testnet

## 📝 Contract State

All contracts are:
- ✅ Deployed to testnet
- ✅ Initialized with admin address
- ✅ Ready for interaction
- ✅ Environment variables configured

## 🆘 Troubleshooting

### Contract Call Fails
- Ensure Freighter wallet is connected
- Check account has XLM for transaction fees
- Verify contract IDs in .env files

### Frontend Not Connecting
- Check .env.local has correct contract IDs
- Restart frontend development server
- Clear browser cache and reconnect Freighter

### Backend API Errors
- Ensure MongoDB is running
- Check backend/.env configuration
- Verify backend server is running on port 5000

## 📞 Support

For issues or questions:
1. Check contract explorer links for transaction history
2. Review Stellar testnet status
3. Check browser console for errors
4. Verify Freighter wallet connection
