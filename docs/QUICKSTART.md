# 🚀 Relifo Quick Start Guide

> Get started building Relifo in 5 minutes

---

## 📖 What is Relifo?

**Relifo** is a blockchain-based disaster relief donation platform that uses **USDC stablecoin** (Circle's regulated USD token) for all donations.

### Key Innovation
- **Beneficiary Self-Registration**: Victims apply directly
- **NGO Approval**: Document verification on blockchain
- **Optional Controls**: Choose Rapid (autonomy) or Controlled (oversight) relief
- **100% Transparent**: All transactions public on Stellar
- **Direct USDC**: No custom token, industry-standard stablecoin

---

## 💰 USDC Stablecoin in 30 Seconds

**What**: Circle's USDC, industry-standard stablecoin
**Backing**: 1 USDC = 1 USD (audited reserves, regulated)
**Peg**: 1 USDC = $1 (Circle maintains real USD reserves)
**Add Balance**: Faucet, XLM swap, card payment, or bank transfer
**Direct Usage**: Donate USDC immediately, no intermediate steps

**Testnet**: Use USDC faucet, swap XLM → USDC, or card payment simulator
**Production**: Swap XLM → USDC, or fiat → USDC via on-ramps (MoneyGram, card, bank)

---

## 📁 Documentation Files (Read in Order)

### 1. **[README.md](README.md)** ← START HERE
- Complete technical architecture
- All 3 smart contracts explained (ReliefVault, BeneficiaryRegistry, MerchantRegistry)
- Data structures and functions
- Frontend architecture

### 2. **[PROJECT_FLOW.md](PROJECT_FLOW.md)**
- User journeys for all 5 roles
- Donor flow with USDC balance management
- Step-by-step interactions

### 3. **[RUSD_IMPLEMENTATION.md](RUSD_IMPLEMENTATION.md)** - DEPRECATED
- Reference only: Shows USDC donor flow diagrams

### 4. **[STEPS.md](STEPS.md)**
- 45+ implementation steps
- 7 phases from setup to deployment
- Verification checklists

### 5. **[SUMMARY.md](SUMMARY.md)**
- Quick reference
- Core decisions
- Tech stack

### 6. **[HACKATHON_DEMO.md](HACKATHON_DEMO.md)**
- 15-minute presentation script
- Live demo breakdown
- Q&A preparation

---

## ⚡ Quick Setup (10 Minutes)

### 1. Install Tools
```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Verify
stellar --version
```

### 2. Create Testnet Accounts
```bash
# Admin account
stellar keys generate --network testnet --name admin
stellar account create admin --network testnet

# Get testnet XLM
curl "https://friendbot.stellar.org?addr=$(stellar keys address admin)"
```

### 3. Deploy Smart Contracts
```bash
# Create ReliefVault contract project
stellar contract init relief-vault

# Build contract (see README.md for code)
cd relief-vault
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/relief_vault.wasm \
  --source admin \
  --network testnet
```

### 4. Test Donations
```bash
# Initialize contract with USDC address
stellar contract invoke \
  --id <RELIEF_VAULT_ID> \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address admin) \
  --usdc_contract <USDC_CONTRACT>

# Test mint (after getting USDC)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source admin \
  --network testnet \
  -- mint \
---

## 🏗️ System Components

### Smart Contracts (3 Total)

```
1. ReliefVault
   ├─ Campaign management
   ├─ Direct USDC donations
   ├─ Fund allocation to beneficiaries
   └─ Spending execution

2. BeneficiaryRegistry
   ├─ Self-registration
   ├─ Application review
   ├─ NGO approval
   └─ Whitelisting

3. MerchantRegistry
   ├─ Merchant registration
   ├─ Category mapping
   └─ Spending validation
```

### Frontend (Next.js)

```
Key Components:
├─ WalletDashboard.tsx   ← Show USDC balance
├─ AddBalance.tsx        ← Get USDC (faucet/card)
├─ CampaignList.tsx      ← Browse campaigns
├─ DonationForm.tsx      ← Donate USDC
├─ BeneficiaryApply.tsx  ← Self-register
├─ NGOApproval.tsx       ← Review applications
├─ AllocationManager.tsx ← Distribute USDC
└─ AuditExplorer.tsx     ← Public transparency
```

---

## 🎯 User Flows

### Donor Flow (4 Steps)
```
1. Create/connect own Stellar wallet (Freighter)
2. Add USDC balance (faucet, swap XLM, card, or bank)
3. View USDC balance in donor dashboard (always visible)
4. Select campaign → Enter donation amount → Donate from your balance
```

### Beneficiary Flow (4 Steps)
```
1. Self-register with documents
2. Wait for NGO approval
3. Receive USDC allocation
4. Spend freely or with controls
```

### NGO Flow (3 Steps)
```
1. Review beneficiary applications
2. Approve with document verification
3. Allocate USDC to approved beneficiaries
```

---

## 🎤 Elevator Pitch (30 Seconds)

"Relifo is a blockchain relief platform where **victims self-register**, **NGOs approve instantly**, and **funds arrive in under 1 hour**.

We use **USDC stablecoin** (Circle's regulated, trusted token) for all donations - **industry standard, no custom token risk**.

Unlike traditional aid (7-14 days, 30% leakage), we're **100% transparent** on Stellar with **optional spending controls** that adapt to emergencies vs. long-term programs.

Built on Stellar. Production-ready with fiat on-ramps (card, bank, MoneyGram)."

---

## 🏆 Hackathon Demo Script (5 Minutes)

### Minute 1: Problem
"Traditional relief: 7-14 days, 30% lost to middlemen, zero transparency."

### Minute 2: Solution
"Relifo: Blockchain-powered, < 1 hour delivery, 100% transparent."

### Minute 3-4: Live Demo
1. Beneficiary applies (self-registration)
2. NGO approves (document check)
3. Allocate USDC
4. Beneficiary spends
5. View audit trail

### Minute 5: Impact
"Faster relief, zero corruption, full transparency. Built on Stellar with direct USDC (industry standard)."

---

## ❓ FAQ

**Q: Why use USDC instead of a custom token?**  
A: USDC is more trusted (Circle's $150B stablecoin), simpler (no minting complexity), and industry standard.

**Q: How is USDC different from regular USD?**  
A: USDC is programmable USD on Stellar - instant transfers, lower fees, global reach.

**Q: What happens in an emergency?**  
A: Funds reach beneficiaries in < 1 hour on Stellar testnet (5-30 seconds on mainnet).

**Q: Can beneficiaries cash out?**  
A: Yes! USDC → Use on-ramps (MoneyGram, card, bank) → Local currency.

**Q: Why Stellar?**  
A: Fast (3-5 sec), cheap ($0.00001 fees), built-in DEX, global reach, USDC native.

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| **Transaction Time** | 3-5 seconds |
| **Transaction Cost** | < $0.01 |
| **Relief Delivery** | < 1 hour |
| **Transparency** | 100% public |
| **Fund Leakage** | < 2% (fees only) |

---

## ✅ Pre-Launch Checklist

- [ ] ReliefVault deployed and initialized
- [ ] BeneficiaryRegistry deployed
- [ ] MerchantRegistry deployed
- [ ] Frontend deployed and accessible
- [ ] Can donate USDC to campaigns
- [ ] Can approve beneficiaries
- [ ] Can allocate funds
- [ ] Audit trail displays correctly
- [ ] Reserve dashboard shows data
- [ ] Presentation slides ready
- [ ] Demo script practiced

---

## 🚀 Next Actions

1. **Read [README.md](README.md)** - Understand full architecture
2. **Review [PROJECT_FLOW.md](PROJECT_FLOW.md)** - Learn user journeys
3. **Execute [STEPS.md](STEPS.md)** - Build all components
4. **Practice [HACKATHON_DEMO.md](HACKATHON_DEMO.md)** - Prepare presentation

---

## 💬 Need Help?

- **Architecture questions**: See [README.md](README.md)
- **User flows**: See [PROJECT_FLOW.md](PROJECT_FLOW.md)
- **Build steps**: See [STEPS.md](STEPS.md)
- **Demo prep**: See [HACKATHON_DEMO.md](HACKATHON_DEMO.md)

---

**Let's build transparent disaster relief! 🌍💙**
