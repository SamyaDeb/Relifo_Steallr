# Relifo - Emergency Relief Platform on Stellar Blockchain

A transparent, blockchain-based emergency relief distribution platform built on Stellar using Soroban smart contracts, Next.js frontend, and MongoDB backend.

## 🌍 Project Overview

Relifo enables efficient disaster relief distribution by:
- **NGOs** create and manage relief campaigns
- **Donors** contribute USDC to relief campaigns with full transparency
- **Beneficiaries** receive allocated funds with spending controls
- **Merchants** process transactions in specific relief categories
- **Admins** verify NGOs and ensure compliance

All transactions are immutable on the Stellar blockchain using USDC stablecoin.

## 📁 Project Structure

```
Relifo/
├── backend/                  # Express.js server (Port 3001)
│   ├── server.js
│   ├── config/mongodb.js     # MongoDB connection
│   ├── scripts/setup-database.js
│   └── utils/fileUpload.js   # GridFS file uploads
│
├── contracts/                # Rust/Soroban smart contracts
│   ├── src/
│   │   ├── vault.rs         # ReliefVault (campaigns, donations, allocations)
│   │   ├── ngo.rs           # NGO Registry
│   │   ├── beneficiary.rs   # Beneficiary Registry
│   │   ├── merchant.rs      # Merchant Registry
│   │   ├── error.rs         # Error types
│   │   ├── event.rs         # Event types
│   │   ├── token.rs         # USDC TokenClient
│   │   └── lib.rs           # Contract exports
│   └── Cargo.toml
│
├── frontend/                 # Next.js 16.1.1 application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # UI components (Navbar, Sidebar, Footer, Layout)
│   │   ├── hooks/
│   │   │   ├── useWallet.ts  # Freighter wallet management
│   │   │   └── useContract.ts # Smart contract interactions
│   │   ├── lib/
│   │   │   ├── mongodb.ts    # MongoDB client
│   │   │   └── stellar.ts    # Stellar SDK config
│   │   └── services/
│   │       ├── freighter.ts  # Freighter wallet integration
│   │       └── soroban.ts    # Soroban RPC client
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                     # Documentation
    ├── STEPS.md             # Implementation steps
    ├── PHASE5_COMPLETION.md # Phase 5 completion report
    └── [other guides]
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.92.0+
- MongoDB Atlas account
- Freighter wallet browser extension
- GitHub account

### 1. Backend Setup

```bash
cd backend
npm install
npm run setup  # Sets up MongoDB connection
```

**Environment Variables** (`.env.local`):
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
```

### 2. Smart Contracts

```bash
cd contracts
cargo check    # Verify compilation
cargo build --target wasm32-unknown-unknown --release  # Build WASM
```

**Deployment**:
- Build to WebAssembly
- Deploy to Stellar Testnet using Soroban CLI
- Update contract IDs in frontend `.env.local`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Start development server (http://localhost:3000)
```

**Environment Variables** (`.env.local`):
```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# USDC Configuration
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

# Contract IDs (after deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ID=CAxxxxx...
NEXT_PUBLIC_NGO_CONTRACT_ID=CAxxxxx...
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=CAxxxxx...
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=CAxxxxx...
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js / Express.js
- **Database**: MongoDB Atlas with GridFS
- **Authentication**: JWT (token-based)

### Smart Contracts
- **Language**: Rust
- **Framework**: Soroban SDK v22.0.0
- **Network**: Stellar Testnet
- **Asset**: USDC (native Stellar stablecoin)

### Frontend
- **Framework**: Next.js 16.1.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Wallet Integration**: Freighter v6.0.1
- **SDK**: @stellar/stellar-sdk v14.4.3
- **Notifications**: React Hot Toast

## 📊 Core Smart Contracts

### ReliefVault Contract
- `initialize()` - Setup campaign
- `create_campaign()` - Create relief campaign
- `donate()` - Contribute to campaign
- `allocate_to_beneficiary()` - Allocate funds to beneficiary
- `authorize_spending()` - Approve spending limits
- `execute_spending()` - Execute controlled spending
- Query functions for campaign/allocation data

### NGO Registry Contract
- `register_ngo()` - Register organization
- `verify_ngo()` - Admin verification
- `revoke_ngo()` - Revoke registration
- `get_pending_ngos()` - List pending approvals

### Beneficiary Registry Contract
- `register_for_campaign()` - Register for aid
- `approve_beneficiary()` - NGO approval
- `enforce_category_spending()` - Controlled spending mode
- Beneficiary status tracking

### Merchant Registry Contract
- `register_merchant()` - Register store/vendor
- `approve_for_category()` - Category approval
- `is_approved_for_category()` - Check approval status
- Merchant information and status

## 💰 USDC Integration

- **Asset Code**: USDC
- **Issuer (Testnet)**: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- **Network**: Stellar Testnet
- All amounts use 7 decimal places (stroops)
- Native Stellar asset (no custom token)

## 🔐 Wallet Integration

Uses **Freighter Wallet** v6.0.1:
- Connect via browser extension
- Sign transactions without exposing private keys
- Manage USDC trustline automatically
- Multi-signature transaction support

## 📈 Project Phases

### Phase 0 ✅ - MongoDB Backend
- MongoDB Atlas cluster setup
- GridFS for PDF uploads
- Database schema and indexes

### Phase 1-4 ✅ - Smart Contracts
- Rust/Soroban project setup
- Error and event types
- TokenClient wrapper
- All 4 contract implementations

### Phase 5 ✅ - Frontend
- Next.js project setup
- Freighter wallet integration
- Soroban RPC client
- Custom hooks and layout components
- UI components (Navbar, Sidebar, Footer)

### Phase 6 - Contract Deployment
- Build and deploy to Testnet
- Configure contract IDs

### Phase 7 - Page Development
- Campaign listing and creation
- Donation flows
- Dashboard interfaces

### Phase 8 - Testing & Launch
- Integration testing
- User acceptance testing
- Performance optimization

## 📝 Documentation

- [STEPS.md](docs/STEPS.md) - Implementation steps
- [PHASE5_COMPLETION.md](docs/PHASE5_COMPLETION.md) - Phase 5 details
- [FREIGHTER_WALLET_INTEGRATION.md](docs/FREIGHTER_WALLET_INTEGRATION.md) - Wallet setup guide
- [MONGODB_SCHEMA.md](docs/MONGODB_SCHEMA.md) - Database schema
- [PROJECT_FLOW.md](docs/PROJECT_FLOW.md) - User flow diagrams

## 🌐 Deployment

### Frontend
- Deploy to Vercel, Netlify, or AWS
- Requires `.env.local` with contract IDs

### Backend
- Deploy to Heroku, Railway, or AWS
- MongoDB Atlas connection string required

### Smart Contracts
- Deploy to Stellar Testnet using Soroban CLI
- Update contract IDs in frontend after deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🏆 Built For

Stellar Hackathon - Emergency Relief Platform Track

## 👥 Authors

- **Samya** - Project lead and full-stack developer

## 🔗 Links

- **GitHub**: https://github.com/SamyaDeb/Relifo_Steallr
- **Stellar Network**: https://stellar.org
- **Soroban Documentation**: https://developers.stellar.org/learn/fundamentals/soroban
- **Freighter Wallet**: https://www.freighter.app/

## 📞 Support

For issues and questions, please create a GitHub Issue or contact the development team.

---

**Status**: Phase 5 Complete (Frontend Setup)
**Next**: Deploy smart contracts to Stellar Testnet
