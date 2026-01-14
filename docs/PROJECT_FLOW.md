# Relifo Project Flow

> Complete end-to-end flow diagrams for the Emergency & Disaster Relief Stablecoin System

---

## 🎯 HACKATHON DEMO MODE (Testnet)

**For the hackathon, we'll use Stellar Testnet with USDC stablecoin:**

### Testing Flow
```
1. SETUP: Deploy relief contracts on Stellar testnet
2. DONORS: Create/connect own wallet → Add USDC balance via payment option → View balance in dashboard
3. DONORS: Select campaign → Donate USDC from wallet balance
4. BENEFICIARIES: Self-register with documents → NGO approves
5. NGOs: Allocate USDC to approved beneficiaries
6. BENEFICIARIES: Spend freely (Rapid Relief) or with optional controls (Controlled Relief)
7. AUDIT: View public transparency on testnet explorer
```

### Testnet Donor Flow
- **Donor Wallet**: Own Stellar wallet, full control of USDC
- **Add Balance**: Multiple options (faucet, XLM swap, card simulator)
- **Dashboard**: See USDC balance in real-time as "Account Balance"
- **Donate**: Select campaign, enter amount, donate from wallet balance
- **Why Simple**: Donors manage their own wallet, transparent balance tracking
- **Production**: XLM swap always available + fiat on-ramps (MoneyGram, card, bank) → USDC → Same dashboard flow

### Why USDC?
- ✅ **Industry standard**: Most trusted stablecoin globally
- ✅ **Backed by USD**: Real money in Circle's audited bank accounts
- ✅ **Regulated**: Circle licensed by US, UK authorities
- ✅ **Simple**: Donors understand USDC trust more than custom token
- ✅ **Focus on innovation**: Beneficiary registration, NGO approval, optional controls

### What Judges Will See
- **Slides**: Explain fiat on-ramps for production (card/bank/MoneyGram → USDC)
- **Demo**: Full beneficiary workflow on testnet (the UNIQUE innovation)
- **Architecture**: Production-ready smart contracts
- **Impact**: Speed, transparency, and cost metrics

---

## Table of Contents

1. [System Overview Flow](#system-overview-flow)
2. [User Journey Flows](#user-journey-flows)
3. [Transaction Flows](#transaction-flows)
4. [Contract Interaction Flows](#contract-interaction-flows)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Event Propagation Flow](#event-propagation-flow)
7. [Security & Validation Flow](#security--validation-flow)

---

## System Overview Flow

### High-Level Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     RELIFO SYSTEM FLOW                           │
└─────────────────────────────────────────────────────────────────┘

SETUP PHASE
───────────
1. Admin → Deploy contracts to Stellar testnet
2. Admin → Register merchants with approved categories
3. NGO → Self-register on platform (create profile)
4. NGO → Get verified by admin (optional: trust score)
5. NGO → Crea te relief campaign (e.g., "Earthquake Relief 2026")

FUNDRAISING PHASE
─────────────────
6. Donors → Browse campaigns on frontend
7. Donors → Buy USDC via MoneyGram Access (integrated fiat onramp)
   - Pay with cash at MoneyGram locations (200+ countries)
   - Pay with credit/debit card online
   - Pay via bank transfer
   - KYC/AML handled by MoneyGram
   - USDC sent directly to donor's Stellar wallet
8. Donors → Donate USDC to campaign
9. Blockchain → Record donation in ReliefVault
10. Event → DonationReceived emitted
11. Campaign balance increases

BENEFICIARY REGISTRATION PHASE
───────────────────────────────
12. Beneficiaries → Browse active campaigns
13. Beneficiaries → Register for campaign relief:
    - Fill application form
    - Upload identity documents
    - Upload proof of need (location, damage photos, etc.)
    - Provide Stellar wallet address
    - Submit application
14. Blockchain → BeneficiaryRegistry.register_for_campaign() called
15. Event → BeneficiaryRegistered emitted
16. NGO → Receives beneficiary applications in dashboard
17. NGO → Review applications:
    - Verify identity documents
    - Verify proof of need
    - Check eligibility criteria
    - Approve or reject
18. NGO → Approve beneficiary
19. Blockchain → BeneficiaryRegistry.approve_beneficiary() called
20. Event → BeneficiaryApproved emitted
21. Beneficiary → Receives approval notification

ALLOCATION PHASE
────────────────
22. NGO → View campaign balance 
23. NGO → View list of approved beneficiaries
24. NGO → Choose allocation mode (OPTIONAL CONTROLS):
    A. RAPID RELIEF MODE (Default for emergencies): 
       - Beneficiary has full spending autonomy
       - No category restrictions
       - No merchant approvals needed
       - Fastest relief distribution
       - Full transparency via audit trail
    B. CONTROLLED RELIEF MODE (Optional oversight):
       - Category-based spending limits
       - Pre-approved merchants only
       - More oversight for long-term programs
       - Use when additional control needed
25. NGO → Select approved beneficiary from list
26. NGO → Allocate USDC to beneficiary
27. If Controlled Mode: NGO sets category limits (Food: $200, Medicine: $100)
28. Blockchain → Record allocation in ReliefVault with mode flag
29. Event → FundsAllocated emitted (includes control_mode)
30. Beneficiary receives notification with spending instructions

SPENDING PHASE
──────────────
31. Beneficiary → View wallet balance on dashboard
32. Beneficiary → Check allocation mode

RAPID RELIEF MODE (Most use cases - emergencies)
─────────────────────────────────────────────────
33. Beneficiary → View allocated USDC balance
34. Beneficiary → Choose spending method:
    A. Send to merchant (scan QR code)
    B. Send to individual (address)
    C. Cash out (USDC to local currency via on-ramp)
    D. Purchase goods online
35. Beneficiary → Enter recipient address and amount
36. Beneficiary → Sign transaction with Freighter wallet
37. Blockchain → Execute standard Stellar USDC transfer
38. Event → DirectTransfer emitted with details
39. Beneficiary → Receive instant confirmation
40. Balance updated in real-time
41. Transaction visible on public audit trail

OPTIONAL: CONTROLLED RELIEF MODE (When additional oversight needed)
──────────────────────────────────────────────────────────────────
33. Beneficiary → Browse pre-approved merchants
34. Beneficiary → Select items within category (e.g., Food: $50)
35. Beneficiary → Request spending authorization
36. Smart Contract → Validate:
    ✓ Beneficiary is whitelisted
    ✓ Merchant is approved for category
    ✓ Amount ≤ category limit ($50 ≤ $200)
    ✓ Amount ≤ total allocation
37. Smart Contract → Create authorization (auth_id: 12345)
38. Event → SpendingAuthorized emitted
39. Merchant → Receives order with auth_id
40. Merchant → Prepares goods/services
41. Merchant → Confirms delivery to beneficiary
42. Merchant → Executes payment via auth_id
43. Blockchain → Transfer USDC to merchant
44. Blockchain → Update spent trackers:
    - Food category: $0 → $50 spent
    - Remaining: $200 → $150
45. Event → TransactionExecuted emitted
46. Beneficiary → See updated balance and transaction

AUDIT PHASE (Continuous)
────────────────────────
47. Anyone → Access public audit explorer (no login required)
48. Anyone → Search/filter transactions by:
    - Campaign ID or name
    - NGO address or name
    - Beneficiary address (anonymized option)
    - Date range
    - Transaction type (donation, allocation, spending)
    - Control mode (Direct/Controlled)
    - Amount range
    - Status (completed, pending, failed)
49. Blockchain → Return all events and transactions from Stellar
50. Frontend → Display complete audit trail:
    - Total donations per campaign
    - Total beneficiaries reached
    - Average distribution time
    - Spending patterns by category
    - NGO performance metrics
    - Geographic distribution map
51. User → Export reports as CSV/PDF
52. User → Verify 100% transparency and fund usage
38. User → Verify transparency and fund usage
```

---

## User Journey Flows

### Journey 1: Donor Flow

**🎯 HACKATHON DEMO VERSION (Testnet)**

```
┌──────────┐
│  DONOR   │
└────┬─────┘
     │
     ├─ STEP 1: Connect Wallet
     │  ├─ Open Relifo frontend
     │  ├─ Click "Connect Wallet"
     │  ├─ Freighter extension opens
     │  ├─ Approve connection
     │
     ├─ STEP 2: Add USDC Balance
     │  ├─ Navigate to donor dashboard
     │  ├─ Click "Add Balance" button
     │  ├─ Choose payment method:
     │  │  ├─ TESTNET OPTION A: Get Testnet USDC (Faucet)
     │  │  │  ├─ Click "Get Testnet USDC" button
     │  │  │  ├─ Instant USDC added to wallet
     │  │  │  └─ No payment needed
     │  │  ├─ TESTNET OPTION B: Swap XLM → USDC
     │  │  │  ├─ Click "Swap XLM to USDC" option
     │  │  │  ├─ View your XLM balance (from Friendbot)
     │  │  │  ├─ Enter amount of XLM to swap (e.g., 100 XLM)
     │  │  │  ├─ See real-time conversion rate displayed
     │  │  │  ├─ Click "Execute Swap"
     │  │  │  ├─ Freighter prompts to approve Stellar DEX transaction
     │  │  │  ├─ Sign transaction (~5 seconds for swap)
     │  │  │  ├─ USDC received and added to wallet balance
     │  │  │  └─ Dashboard updates: "Balance: 100 USDC"
     │  │  └─ TESTNET OPTION C: Card Payment Simulator
     │  │     ├─ Enter amount (e.g., 500 USDC)
     │  │     └─ Instant USDC credited
     │  ├─ See real-time balance update in dashboard
     │  ├─ Wallet shows: "Available: [X] USDC"
     │  └─ Ready to donate
     │
     ├─ STEP 3: Browse Campaigns
     │  ├─ View campaign list
     │  ├─ See campaign details:
     │  │  ├─ Description
     │  │  ├─ NGO name
     │  │  ├─ Total raised (in USDC)
     │  │  ├─ Goal amount
     │  │  └─ Beneficiaries count
     │  └─ Select campaign
     │
     ├─ STEP 4: Make Donation
     │  ├─ Enter donation amount in USDC (e.g., 50 USDC)
     │  ├─ Review transaction details:
     │  │  ├─ From: Your wallet
     │  │  ├─ To: Campaign vault
     │  │  ├─ Amount: 50 USDC
     │  │  └─ New balance after: 450 USDC
     │  ├─ Click "Donate"
     │  ├─ Freighter prompts for approval
     │  ├─ Sign transaction
     │  └─ Wait for confirmation (~5 seconds)
     │
     ├─ STEP 5: Transaction Confirmation
     │  ├─ Blockchain processes transaction
     │  ├─ ReliefVault.donate() called
     │  ├─ USDC transferred directly from wallet to vault
     │  ├─ Campaign balance updated: +50 USDC
     │  ├─ DonationReceived event emitted
     │  └─ Success message displayed
     │
     └─ STEP 6: Track Donation
        ├─ View donation in history
        ├─ See transaction hash
        ├─ Click to view on Stellar Testnet Explorer
        └─ Monitor campaign progress

OUTCOME: Donor funded campaign with real USDC in < 1 minute
```

---

**📱 PRODUCTION VERSION (Mainnet with Fiat On-Ramps)**

```
┌──────────┐
│  DONOR   │
└────┬─────┘
     │
     ├─ STEP 1: Connect Wallet
     │  ├─ Open Relifo frontend
     │  ├─ Click "Connect Wallet"
     │  ├─ Freighter extension opens
     │  ├─ Approve connection
     │  └─ See public key in navbar
     │
     ├─ STEP 2: Add USDC Balance via Multiple Methods
     │  ├─ Click "Add Balance" button in dashboard
     │  ├─ Choose payment method:
     │  │  ├─ OPTION A: Swap XLM → USDC (Anytime)
     │  │  │  ├─ Click "Swap XLM to USDC" option
     │  │  │  ├─ View your XLM balance
     │  │  │  ├─ Enter amount of XLM to swap
     │  │  │  ├─ See conversion rate: XLM price vs USDC
     │  │  │  ├─ Click "Execute Swap" via Stellar DEX
     │  │  │  ├─ Freighter prompts for DEX transaction approval
     │  │  │  ├─ Sign transaction
     │  │  │  ├─ USDC received instantly from DEX
     │  │  │  └─ Notification: "Received [X] USDC from XLM swap"
     │  │  ├─ OPTION B: Cash via MoneyGram/Similar
     │  │  │  ├─ Enter amount (e.g., $100)
     │  │  │  ├─ Get reference code
     │  │  │  ├─ Visit nearest agent location (200+ countries)
     │  │  │  ├─ Show ID + reference code
     │  │  │  ├─ Pay cash
     │  │  │  └─ Backend: Fiat → USDC via on-ramp (15 min)
     │  │  ├─ OPTION C: Card Payment Online
     │  │  │  ├─ Enter card details
     │  │  │  ├─ Complete 3D Secure verification
     │  │  │  ├─ Payment processed
     │  │  │  └─ Backend: Fiat → USDC instantly
     │  │  └─ OPTION D: Bank Transfer
     │  │     ├─ Get bank details
     │  │     ├─ Initiate transfer from bank
     │  │     ├─ Wait 1-3 business days
     │  │     └─ Backend: Fiat → USDC after confirmation
     │  ├─ KYC/AML handled by on-ramp provider (one-time for fiat options)
     │  ├─ USDC sent to donor's Stellar wallet address
     │  ├─ Dashboard updates real-time: "Account Balance: [X] USDC"
     │  ├─ Transaction appears in wallet transaction history
     │  └─ Ready to donate
     │
     ├─ STEP 3: Browse Campaigns
     │  ├─ View campaign list
     │  ├─ See campaign details:
     │  │  ├─ Description
     │  │  ├─ NGO name
     │  │  ├─ Total raised
     │  │  ├─ Goal amount
     │  │  └─ Beneficiaries count
     │  └─ Select campaign
     │
     ├─ STEP 4: Make Donation
     │  ├─ Enter donation amount (USDC)
     │  ├─ Review transaction
     │  ├─ Click "Donate"
     │  ├─ Freighter prompts for approval
     │  ├─ Sign transaction
     │  └─ Wait for confirmation
     │
     ├─ STEP 5: Transaction Confirmation
     │  ├─ Blockchain processes transaction
     │  ├─ ReliefVault.donate() called
     │  ├─ USDC transferred to vault
     │  ├─ Campaign balance updated
     │  ├─ DonationReceived event emitted
     │  └─ Success message displayed
     │
     └─ STEP 6: Track Donation
        ├─ View donation in history
        ├─ See transaction hash
        ├─ Click to view on Stellar Explorer
        └─ Monitor campaign progress

OUTCOME: Donation recorded on blockchain, funds in escrow
```

### Journey 2: NGO Flow

```
┌──────────┐
│   NGO    │
└────┬─────┘
     │
     ├─ STEP 1: Register as NGO
     │  ├─ Open Relifo platform
     │  ├─ Click "Register as NGO" 
     │  ├─ Fill registration form:
     │  │  ├─ Organization name
     │  │  ├─ Registration number
     │  │  ├─ Country/Region
     │  │  ├─ Contact details
     │  │  ├─ Upload documents (certificate)
     │  │  └─ Stellar wallet address
     │  ├─ Submit for verification
     │  ├─ Admin reviews (manual)
     │  ├─ NGORegistry.register_ngo() called
     │  ├─ NGORegistered event emitted
     │  └─ Receive approval notification
     │
     ├─ STEP 2: Create Campaign
     │  ├─ Connect wallet
     │  ├─ Click "Create Campaign"
     │  ├─ Fill campaign details:
     │  │  ├─ Campaign name
     │  │  ├─ Description
     │  │  ├─ Goal amount
     │  │  ├─ Category (disaster type)
     │  │  ├─ Location
     │  │  ├─ Duration
     │  │  └─ Control mode (Controlled)
     │  ├─ ReliefVault.create_campaign() called
     │  ├─ CampaignCreated event emitted
     │  └─ Campaign goes live
     │
     ├─ STEP 3: Access NGO Dashboard
     │  ├─ View created campaigns
     │  ├─ See total donations
     │  └─ Check available balance
     │
     ├─ STEP 4: Choose Control Mode
     │  ├
     │  └─ OPTION A: Controlled Mode
     │     ├─ Category-based spending
     │     ├─ Merchant whitelisting required
     │     ├─ Spending limits enforced
     │     └─ More oversight
     │
     ├─ STEP 5: Review Beneficiary Applications
     │  ├─ Access "Applications" tab in dashboard
     │  ├─ View list of pending applications:
     │  │  ├─ Application ID
     │  │  ├─ Applicant name
     │  │  ├─ Submission date
     │  │  ├─ Campaign applied for
     │  │  └─ Status (Pending/Under Review/Approved/Rejected)
     │  ├─ Click on application to review
     │  ├─ View application details:
     │  │  ├─ Personal information
     │  │  ├─ Family details
     │  │  ├─ Location & contact
     │  │  ├─ Description of need
     │  │  └─ Stellar wallet address
     │  ├─ View uploaded documents:
     │  │  ├─ Identity proof
     │  │  ├─ Proof of residency
     │  │  ├─ Damage documentation
     │  │  └─ Supporting documents
     │  ├─ Verify documents:
     │  │  ├─ Check identity authenticity
     │  │  ├─ Verify location matches campaign
     │  │  ├─ Assess severity of need
     │  │  └─ Check eligibility criteria
     │  ├─ Make decision:
     │  │  ├─ APPROVE: if verified and eligible
     │  │  └─ REJECT: if verification fails or ineligible
     │  └─ Add verification notes
     │
     ├─ STEP 6: Approve/Reject Beneficiaries
     │  ├─ A. TO APPROVE:
     │  │  ├─ Click "Approve Beneficiary"
     │  │  ├─ (Controlled Mode) Set category limits:
     │  │  │  ├─ Food: $200
     │  │  │  ├─ Medicine: $100
     │  │  │  └─ Shelter: $150
     │  │  ├─ Add approval notes
     │  │  ├─ Sign transaction with wallet
     │  │  ├─ BeneficiaryRegistry.approve_beneficiary() called
     │  │  ├─ BeneficiaryApproved event emitted
     │  │  ├─ Beneficiary receives notification
     │  │  └─ Application moves to "Approved" list
     │  └─ B. TO REJECT:
     │     ├─ Click "Reject Application"
     │     ├─ Select rejection reason:
     │     │  ├─ Incomplete documents
     │     │  ├─ Failed verification
     │     │  ├─ Outside eligible area
     │     │  ├─ Does not meet criteria
     │     │  └─ Other (specify)
     │     ├─ Add rejection notes
     │     ├─ Submit rejection
     │     ├─ Beneficiary receives notification
     │     └─ Application moves to "Rejected" list
     │
     ├─ STEP 7: Allocate Funds to Approved Beneficiaries
     │  ├─ View list of approved beneficiaries
     │  ├─ Select beneficiary
     │  ├─ Enter allocation amount
     │  ├─ Confirm control mode
     │  ├─ Confirm category limits (if Controlled, already set during approval)
     │  ├─ Click "Allocate Funds"
     │  ├─ Sign transaction with wallet
     │  ├─ ReliefVault.allocate_to_beneficiary() called
     │  ├─ Verify campaign balance sufficient
     │  ├─ Verify beneficiary is approved
     │  ├─ Store allocation on-chain
     │  ├─ FundsAllocated event emitted
     │  ├─ Beneficiary receives notification
     │  └─ Confirmation displayed
     │
     ├─ STEP 8: Monitor Spending
     │  ├─ View real-time spending dashboard
     │  ├─ Track each beneficiary:
     │  │  ├─ Total allocated
     │  │  ├─ Total spent
     │  │  ├─ Remaining balance
     │  │  └─ Recent transactions
     │  ├─ View spending mode (Direct/Controlled)
     │  ├─ See category spending breakdown (Controlled mode)
     │  ├─ Identify unused allocations
     │  ├─ See spending velocity trends
     │  └─ Generate reports for donors
     │
     ├─ STEP 9: Manage Applications & Allocations
     │  ├─ Review pending applications regularly
     │  ├─ Approve/reject new applicants
     │  ├─ Allocate funds to newly approved beneficiaries
     │  ├─ Monitor campaign fund balance
     │  └─ Close campaign when complete
     │
     └─ STEP 10: Adjust Limits (Controlled Mode)
        ├─ Select beneficiary
        ├─ Modify category limits
        ├─ BeneficiaryRegistry.update_category_limits()
        └─ Confirmation

OUTCOME: NGO registered, campaign created, beneficiaries allocated funds
```

### Journey 3: Beneficiary Flow

```
┌──────────────┐
│ BENEFICIARY  │
└──────┬───────┘
       │
       ├─ STEP 1: Browse Active Campaigns
       │  ├─ Access Relifo platform (no wallet needed yet)
       │  ├─ View list of active relief campaigns
       │  ├─ Filter by:
       │  │  ├─ Location/region
       │  │  ├─ Disaster type
       │  │  ├─ NGO name
       │  │  └─ Relief type (cash, vouchers, etc.)
       │  ├─ View campaign details:
       │  │  ├─ Campaign name & description
       │  │  ├─ NGO information
       │  │  ├─ Eligibility criteria
       │  │  ├─ Required documents
       │  │  ├─ Total funding available
       │  │  └─ Application deadline
       │  └─ Click "Apply for Relief"
       │
       ├─ STEP 2: Register for Campaign
       │  ├─ Fill registration form:
       │  │  ├─ Full name
       │  │  ├─ National ID or identification number
       │  │  ├─ Contact information (phone/email)
       │  │  ├─ Current location/address
       │  │  ├─ Family size
       │  │  ├─ Description of need
       │  │  └─ Stellar wallet address (or create new)
       │  ├─ Upload documents:
       │  │  ├─ Identity proof (ID card, passport, etc.)
       │  │  ├─ Proof of residency
       │  │  ├─ Damage documentation (photos/reports)
       │  │  └─ Other supporting documents
       │  ├─ Documents stored:
       │  │  ├─ Option A: IPFS with hash on-chain
       │  │  └─ Option B: Encrypted off-chain storage
       │  ├─ Create/import Freighter wallet (if needed)
       │  ├─ Sign registration transaction
       │  ├─ BeneficiaryRegistry.register_for_campaign() called
       │  ├─ BeneficiaryRegistered event emitted
       │  ├─ Application ID generated
       │  └─ Confirmation: "Application submitted successfully"
       │
       ├─ STEP 3: Track Application Status
       │  ├─ View application dashboard
       │  ├─ See status:
       │  │  ├─ "Pending Review" (yellow)
       │  │  ├─ "Under Verification" (blue)
       │  │  ├─ "Approved" (green)
       │  │  └─ "Rejected" (red with reason)
       │  ├─ See verification progress:
       │  │  ├─ Documents received ✓
       │  │  ├─ Identity verified ⏳
       │  │  ├─ Eligibility check ⏳
       │  │  └─ Final approval ⏳
       │  ├─ Receive notifications:
       │  │  ├─ Email/SMS updates
       │  │  └─ In-app notifications
       │  └─ Wait for NGO approval
       │
       ├─ STEP 4: Receive Approval Notification
       │  ├─ NGO approves application
       │  ├─ BeneficiaryApproved event emitted
       │  ├─ Beneficiary receives notification:
       │  │  ├─ "Congratulations! You've been approved"
       │  │  ├─ Approval details
       │  │  ├─ Next steps instructions
       │  │  └─ Expected allocation timeline
       │  └─ Status changes to "Approved - Awaiting Allocation"
       │
       ├─ STEP 5: Receive Fund Allocation
       │  ├─ NGO allocates USDC to beneficiary
       │  ├─ FundsAllocated event emitted
       │  ├─ Notification received:
       │  │  ├─ "Funds allocated to your wallet"
       │  │  ├─ Amount: $450 USDC
       │  │  ├─ Control mode: Direct or Controlled
       │  │  └─ Category limits (if Controlled mode)
       │  └─ Access spending dashboard
       │
       ├─ STEP 6: Check Balance & Mode
       │  ├─ Connect Freighter wallet
       │  ├─ View allocation summary:
       │  │  ├─ Total allocated: $450
       │  │  ├─ Total spent: $0
       │  │  ├─ Remaining: $450
       │  │  └─ Control mode indicator
       │  └─ See spending instructions based on mode
       │
       ├─ STEP 7A: Spend Funds (DIRECT MODE - Default)
       │  ├─ View full balance: $450 USDC
       │  ├─ Choose spending method:
       │  │  ├─ A. Send to merchant (QR code scan)
       │  │  ├─ B. Send to individual address
       │  │  ├─ C. Cash out via MoneyGram
       │  │  └─ D. Purchase goods online
       │  ├─ Enter recipient address & amount
       │  ├─ Add memo/description (optional)
       │  ├─ Review transaction
       │  ├─ Sign with Freighter wallet
       │  ├─ Execute standard Stellar USDC transfer
       │  ├─ DirectTransfer event emitted
       │  ├─ Instant confirmation
       │  ├─ Balance updated immediately
       │  ├─ Transaction visible on audit trail
       │  └─ Receipt generated
       │
       ├─ STEP 7B: Spend Funds (CONTROLLED MODE - Optional)
       │  ├─ View allocation by category:
       │  │  ├─ Food: $200 / $200 remaining
       │  │  ├─ Medicine: $100 / $100 remaining
       │  │  └─ Shelter: $150 / $150 remaining
       │  ├─ Browse pre-approved merchants
       │  ├─ Filter by category (e.g., Food)
       │  ├─ Select merchant
       │  ├─ Choose items (e.g., groceries $50)
       │  ├─ Request spending authorization
       │  ├─ ReliefVault.authorize_spending() validates:
       │  │  ├─ ✓ Beneficiary whitelisted
       │  │  ├─ ✓ Merchant approved for Food
       │  │  ├─ ✓ $50 ≤ $200 (Food limit)
       │  │  └─ ✓ $50 ≤ $450 (Total allocation)
       │  ├─ Authorization created (auth_id: 12345)
       │  ├─ SpendingAuthorized event emitted
       │  ├─ Merchant confirms delivery
       │  ├─ ReliefVault.execute_spending(auth_id)
       │  ├─ USDC transferred to merchant
       │  ├─ Balances updated:
       │  │  ├─ Food: $200 → $150 remaining
       │  │  ├─ Total: $450 → $400 remaining
       │  ├─ TransactionExecuted event emitted
       │  └─ Confirmation & receipt shown
       │
       ├─ STEP 8: View Transaction History
       │  ├─ Access transaction dashboard
       │  ├─ See all spending transactions
       │  ├─ Filter by:
       │  │  ├─ Date range
       │  │  ├─ Category (Controlled mode)
       │  │  ├─ Merchant
       │  │  └─ Amount range
       │  ├─ View details for each transaction:
       │  │  ├─ Transaction ID
       │  │  ├─ Date & time
       │  │  ├─ Amount spent
       │  │  ├─ Recipient
       │  │  ├─ Category (if Controlled)
       │  │  └─ Stellar transaction link
       │  └─ Export statement as PDF/CSV
       │
       └─ STEP 9: Request Additional Support (if needed)
          ├─ View remaining balance
          ├─ If funds depleted and need continues
          ├─ Apply for additional campaigns
          ├─ Or contact NGO for assistance
          └─ Track new application status

OUTCOME: Beneficiary registered, approved, funded, and able to spend autonomously
```

### Journey 4: Merchant Flow

```
┌───────────┐
│ MERCHANT  │
└─────┬─────┘
      │
      ├─ STEP 1: Registration
      │  ├─ Admin registers merchant
      │  ├─ Set approved categories:
      │  │  ├─ Food
      │  │  └─ Medicine
      │  ├─ MerchantRegistry.register_merchant()
      │  ├─ MerchantRegistered event emitted
      │  └─ Merchant receives credentials
      │
      ├─ STEP 2: Access Merchant Dashboard
      │  ├─ Connect wallet
      │  ├─ View merchant profile
      │  ├─ See approved categories
      │  └─ View pending orders
      │
      ├─ STEP 3: Receive Order
      │  ├─ Beneficiary requests spending
      │  ├─ Authorization created
      │  ├─ Order appears in dashboard:
      │  │  ├─ Beneficiary ID
      │  │  ├─ Amount: $50
      │  │  ├─ Category: Food
      │  │  ├─ Auth ID: 12345
      │  │  └─ Status: Pending
      │  └─ Merchant reviews order
      │
      ├─ STEP 4: Fulfill Order
      │  ├─ Prepare items
      │  ├─ Deliver to beneficiary
      │  ├─ Get confirmation signature
      │  └─ Mark as "Delivered"
      │
      ├─ STEP 5: Execute Payment
      │  ├─ Click "Complete Order"
      │  ├─ Enter auth_id: 12345
      │  ├─ ReliefVault.execute_spending(12345)
      │  ├─ USDC transferred to merchant wallet
      │  ├─ TransactionExecuted event emitted
      │  ├─ Order marked as Completed
      │  └─ Payment confirmation
      │
      └─ STEP 6: Track Earnings
         ├─ View payment history
         ├─ See total received
         ├─ Filter by category
         ├─ Generate sales reports
         └─ Export for accounting

OUTCOME: Merchant receives payment for goods/services
```

### Journey 5: Public Auditor Flow

```
┌──────────────┐
│   AUDITOR    │
│  (Anyone)    │
└──────┬───────┘
       │
       ├─ STEP 1: Access Audit Explorer
       │  ├─ Open Relifo public audit page
       │  ├─ No wallet required
       │  ├─ No authentication needed
       │  └─ See all campaigns
       │
       ├─ STEP 2: Search Transactions
       │  ├─ Search by:
       │  │  ├─ Campaign ID
       │  │  ├─ Beneficiary address
       │  │  ├─ Merchant address
       │  │  ├─ Transaction hash
       │  │  ├─ Date range
       │  │  └─ Category
       │  └─ Results displayed
       │
       ├─ STEP 3: View Transaction Details
       │  ├─ Click on transaction
       │  ├─ See full details:
       │  │  ├─ From: Donor address
       │  │  ├─ To: Vault/Merchant
       │  │  ├─ Amount: $50 USDC
       │  │  ├─ Category: Food
       │  │  ├─ Timestamp
       │  │  ├─ Block height
       │  │  ├─ Transaction hash
       │  │  ├─ Auth ID (if spending)
       │  │  └─ Status: Executed
       │  └─ Verify on Stellar Explorer
       │
       ├─ STEP 4: Analyze Campaign
       │  ├─ View campaign metrics:
       │  │  ├─ Total donations: $10,000
       │  │  ├─ Total allocated: $8,000
       │  │  ├─ Total spent: $6,500
       │  │  ├─ Remaining: $3,500
       │  │  └─ Number of beneficiaries: 20
       │  ├─ Category breakdown:
       │  │  ├─ Food: 40%
       │  │  ├─ Medicine: 35%
       │  │  └─ Shelter: 25%
       │  └─ Timeline visualization
       │
       └─ STEP 5: Export Report
          ├─ Generate audit report
          ├─ Export as CSV/PDF
          ├─ Share publicly
          └─ Verify transparency

OUTCOME: Complete transparency, anyone can audit
```

---

## Transaction Flows

### Flow 1: Donation Transaction

```
┌────────┐                  ┌─────────────┐                 ┌──────────────┐
│ Donor  │                  │  Frontend   │                 │  Blockchain  │
└───┬────┘                  └──────┬──────┘                 └──────┬───────┘
    │                              │                               │
    │ 1. Click "Donate $100"       │                               │
    ├────────────────────────────> │                               │
    │                              │                               │
    │                              │ 2. Build transaction          │
    │                              │    - Call ReliefVault.donate()│
    │                              │    - campaign_id: "earthquake"│
    │                              │    - amount: 100 USDC         │
    │                              ├─────────────────────────────> │
    │                              │                               │
    │ 3. Freighter popup           │                               │
    │    "Sign transaction?"       │                               │
    │ <──────────────────────────  │                               │
    │                              │                               │
    │ 4. Approve                   │                               │
    ├────────────────────────────> │                               │
    │                              │                               │
    │                              │ 5. Submit signed tx           │
    │                              ├─────────────────────────────> │
    │                              │                               │
    │                              │                               │ 6. Validate:
    │                              │                               │    - Campaign exists?
    │                              │                               │    - Amount > 0?
    │                              │                               │    - USDC balance OK?
    │                              │                               │
    │                              │                               │ 7. Transfer USDC:
    │                              │                               │    donor → vault
    │                              │                               │
    │                              │                               │ 8. Update storage:
    │                              │                               │    campaign_balance += 100
    │                              │                               │
    │                              │                               │ 9. Emit event:
    │                              │                               │    DonationReceived {
    │                              │                               │      campaign: "earthquake"
    │                              │                               │      donor: GABC...
    │                              │                               │      amount: 100
    │                              │                               │    }
    │                              │                               │
    │                              │ 10. Transaction successful    │
    │                              │ <─────────────────────────────┤
    │                              │     tx_hash: 0xABC123...      │
    │                              │                               │
    │ 11. Show confirmation        │                               │
    │     "Donated $100!"          │                               │
    │ <──────────────────────────  │                               │
    │     tx_hash: 0xABC123...     │                               │
    │                              │                               │
```

### Flow 2: Fund Allocation Transaction

```
┌────────┐                  ┌─────────────┐                 ┌──────────────┐
│  NGO   │                  │  Frontend   │                 │  Blockchain  │
└───┬────┘                  └──────┬──────┘                 └──────┬───────┘
    │                              │                               │
    │ 1. Select beneficiary        │                               │
    │    Enter amount: $200        │                               │
    │    Set categories:           │                               │
    │    - Food: $100              │                               │
    │    - Medicine: $100          │                               │
    ├────────────────────────────> │                               │
    │                              │                               │
    │                              │ 2. Build transaction          │
    │                              │    allocate_to_beneficiary()  │
    │                              ├─────────────────────────────> │
    │                              │                               │
    │                              │                               │ 3. Validate:
    │                              │                               │    - Caller is NGO?
    │                              │                               │    - Beneficiary whitelisted?
    │                              │                               │    - Campaign balance ≥ $200?
    │                              │                               │
    │                              │                               │ 4. Query registries:
    │                              │                               │    BeneficiaryRegistry.
    │                              │                               │    is_whitelisted(GXYZ)?
    │                              │                               │    → true
    │                              │                               │
    │                              │                               │ 5. Update storage:
    │                              │                               │    beneficiary_allocations[GXYZ] = 200
    │                              │                               │    category_limits[GXYZ]["food"] = 100
    │                              │                               │    category_limits[GXYZ]["medicine"] = 100
    │                              │                               │    campaign_balance -= 200
    │                              │                               │
    │                              │                               │ 6. Emit event:
    │                              │                               │    FundsAllocated {
    │                              │                               │      beneficiary: GXYZ...
    │                              │                               │      amount: 200
    │                              │                               │      categories: [food, medicine]
    │                              │                               │    }
    │                              │                               │
    │                              │ 7. Success                    │
    │                              │ <─────────────────────────────┤
    │                              │                               │
    │ 8. Show confirmation         │                               │
    │    "Allocated $200"          │                               │
    │ <──────────────────────────  │                               │
    │                              │                               │
```

### Flow 3: Spending Authorization & Execution

```
┌─────────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐
│ Beneficiary │  │ Merchant │  │  Frontend   │  │  Blockchain  │
└──────┬──────┘  └────┬─────┘  └──────┬──────┘  └──────┬───────┘
       │              │               │                 │
       │ 1. Request spending          │                 │
       │    Amount: $50               │                 │
       │    Category: Food            │                 │
       │    Merchant: GMER...         │                 │
       ├────────────────────────────> │                 │
       │                              │                 │
       │                              │ 2. authorize_spending()
       │                              ├───────────────> │
       │                              │                 │
       │                              │                 │ 3. Validations:
       │                              │                 │    ✓ Beneficiary whitelisted?
       │                              │                 │    ✓ Merchant registered?
       │                              │                 │    ✓ Merchant approved for Food?
       │                              │                 │    ✓ allocation[GXYZ] ≥ 50?
       │                              │                 │    ✓ food_limit[GXYZ] ≥ 50?
       │                              │                 │
       │                              │                 │ 4. Create authorization:
       │                              │                 │    auth_id = 12345
       │                              │                 │    status = Pending
       │                              │                 │    store authorization
       │                              │                 │
       │                              │                 │ 5. Emit event:
       │                              │                 │    SpendingAuthorized {
       │                              │                 │      auth_id: 12345
       │                              │                 │      beneficiary: GXYZ
       │                              │                 │      merchant: GMER
       │                              │                 │      amount: 50
       │                              │                 │      category: "food"
       │                              │                 │    }
       │                              │                 │
       │                              │ 6. Return auth_id
       │                              │ <───────────────┤
       │                              │    12345        │
       │                              │                 │
       │ 7. Show auth_id              │                 │
       │    "Authorization: 12345"    │                 │
       │ <──────────────────────────  │                 │
       │                              │                 │
       │                              │ 8. Notify       │
       │                              │    merchant     │
       │                              ├───────────────> │
       │                              │                 │
       │              9. Deliver goods                  │
       │ <───────────────────────────┤                 │
       │              (offline)       │                 │
       │                              │                 │
       │              10. Execute payment              │
       │                 auth_id: 12345                │
       │              ├─────────────────────────────> │
       │              │                │                │
       │              │                │                │ 11. Validate:
       │              │                │                │     - auth exists?
       │              │                │                │     - status = Pending?
       │              │                │                │     - not executed?
       │              │                │                │
       │              │                │                │ 12. Execute:
       │              │                │                │     - Transfer USDC:
       │              │                │                │       vault → merchant (50)
       │              │                │                │     - Update balances:
       │              │                │                │       allocations[GXYZ] -= 50
       │              │                │                │       category_spent[GXYZ]["food"] += 50
       │              │                │                │       beneficiary_spent[GXYZ] += 50
       │              │                │                │     - Mark auth as Executed
       │              │                │                │
       │              │                │                │ 13. Emit event:
       │              │                │                │     TransactionExecuted {
       │              │                │                │       auth_id: 12345
       │              │                │                │       merchant: GMER
       │              │                │                │       amount: 50
       │              │                │                │     }
       │              │                │                │
       │              │                │ 14. Success    │
       │              │                │ <──────────────┤
       │              │                │                │
       │              15. Confirmation │                │
       │              "Payment received: $50"          │
       │              ├───────────────────────────────> │
       │                              │                 │
       │ 16. Balance updated          │                │
       │     Food: $100 → $50         │                │
       │ <──────────────────────────  │                │
       │                              │                 │
```

---

## Contract Interaction Flows

### Contract Communication Pattern

```
┌──────────────────┐         ┌─────────────────────┐         ┌────────────────────┐
│  ReliefVault     │         │ BeneficiaryRegistry │         │  MerchantRegistry  │
│  (Main Contract) │         │   (Dependency)      │         │   (Dependency)     │
└────────┬─────────┘         └──────────┬──────────┘         └──────────┬─────────┘
         │                              │                               │
         │                              │                               │
         │ allocate_to_beneficiary()    │                               │
         ├────────────────────────────> │                               │
         │                              │                               │
         │ is_whitelisted(GXYZ)?        │                               │
         ├────────────────────────────> │                               │
         │                              │                               │
         │ <──────── true ──────────────┤                               │
         │                              │                               │
         │ (proceed with allocation)    │                               │
         │                              │                               │
         │                              │                               │
         │ authorize_spending()         │                               │
         ├────────────────────────────────────────────────────────────> │
         │                              │                               │
         │ is_approved_for_category(GMER, "food")?                      │
         ├────────────────────────────────────────────────────────────> │
         │                              │                               │
         │ <──────────── true ──────────────────────────────────────────┤
         │                              │                               │
         │ (create authorization)       │                               │
         │                              │                               │
```

### Data Dependencies

```
OPERATION: allocate_to_beneficiary()

REQUIRES:
├─ Campaign exists (internal check)
├─ Campaign has balance (internal check)
├─ Caller is NGO (internal check)
└─ Beneficiary is whitelisted (external: BeneficiaryRegistry)

OPERATION: authorize_spending()

REQUIRES:
├─ Beneficiary allocation exists (internal check)
├─ Beneficiary has balance (internal check)
├─ Category limit not exceeded (internal check)
├─ Beneficiary is whitelisted (external: BeneficiaryRegistry)
└─ Merchant approved for category (external: MerchantRegistry)

OPERATION: execute_spending()

REQUIRES:
├─ Authorization exists (internal check)
├─ Authorization status = Pending (internal check)
├─ USDC balance in vault (external: USDC contract)
└─ No other dependencies
```

---

## Data Flow Architecture

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELIFO STORAGE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ ReliefVault Storage                                    │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ campaigns: Map<String, Campaign>                       │     │
│  │   └─ "earthquake_2026" → Campaign { ... }             │     │
│  │                                                        │     │
│  │ campaign_balances: Map<String, i128>                   │     │
│  │   └─ "earthquake_2026" → 10000                         │     │
│  │                                                        │     │
│  │ beneficiary_allocations: Map<Address, i128>            │     │
│  │   └─ GXYZ... → 200                                     │     │
│  │                                                        │     │
│  │ category_limits: Map<Address, Map<String, i128>>       │     │
│  │   └─ GXYZ... → { "food": 100, "medicine": 100 }       │     │
│  │                                                        │     │
│  │ category_spent: Map<Address, Map<String, i128>>        │     │
│  │   └─ GXYZ... → { "food": 50, "medicine": 0 }          │     │
│  │                                                        │     │
│  │ authorizations: Map<u64, SpendingAuthorization>        │     │
│  │   └─ 12345 → SpendingAuthorization { ... }            │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ BeneficiaryRegistry Storage                            │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ whitelisted: Map<Address, BeneficiaryInfo>             │     │
│  │   └─ GXYZ... → BeneficiaryInfo {                       │     │
│  │        status: Active,                                 │     │
│  │        approved_categories: ["food", "medicine"]       │     │
│  │      }                                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ MerchantRegistry Storage                               │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ merchants: Map<Address, MerchantInfo>                  │     │
│  │   └─ GMER... → MerchantInfo {                          │     │
│  │        status: Approved,                               │     │
│  │        approved_categories: ["food"]                   │     │
│  │      }                                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### State Changes Flow

```
DONATION EVENT
──────────────
Before:
  campaign_balances["earthquake_2026"] = 9900

Transaction: donate(campaign_id: "earthquake_2026", amount: 100)

After:
  campaign_balances["earthquake_2026"] = 10000

Event: DonationReceived { campaign: "earthquake_2026", donor: GABC, amount: 100 }

─────────────────────────────────────────────────────────────────

ALLOCATION EVENT
────────────────
Before:
  campaign_balances["earthquake_2026"] = 10000
  beneficiary_allocations[GXYZ] = 0

Transaction: allocate_to_beneficiary(beneficiary: GXYZ, amount: 200, ...)

After:
  campaign_balances["earthquake_2026"] = 9800
  beneficiary_allocations[GXYZ] = 200
  category_limits[GXYZ] = { "food": 100, "medicine": 100 }
  category_spent[GXYZ] = { "food": 0, "medicine": 0 }

Event: FundsAllocated { beneficiary: GXYZ, amount: 200, ... }

─────────────────────────────────────────────────────────────────

SPENDING AUTHORIZATION EVENT
────────────────────────────
Before:
  authorizations = { }

Transaction: authorize_spending(beneficiary: GXYZ, merchant: GMER, amount: 50, category: "food")

After:
  authorizations[12345] = SpendingAuthorization {
    id: 12345,
    beneficiary: GXYZ,
    merchant: GMER,
    amount: 50,
    category: "food",
    status: Pending
  }

Event: SpendingAuthorized { auth_id: 12345, ... }

─────────────────────────────────────────────────────────────────

SPENDING EXECUTION EVENT
────────────────────────
Before:
  beneficiary_allocations[GXYZ] = 200
  category_spent[GXYZ]["food"] = 0
  authorizations[12345].status = Pending

Transaction: execute_spending(auth_id: 12345)

After:
  beneficiary_allocations[GXYZ] = 150
  category_spent[GXYZ]["food"] = 50
  authorizations[12345].status = Executed
  [USDC transferred to merchant]

Event: TransactionExecuted { auth_id: 12345, ... }
```

---

## Event Propagation Flow

### Event Emission & Listening

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Blockchain  │         │  Event Bus   │         │   Frontend   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Transaction executed │                        │
       │    donate()            │                        │
       │                        │                        │
       │ 2. Emit event          │                        │
       │    DonationReceived    │                        │
       ├──────────────────────> │                        │
       │                        │                        │
       │                        │ 3. Event indexed       │
       │                        │    by Soroban RPC      │
       │                        │                        │
       │                        │ 4. Event available     │
       │                        │    via getEvents()     │
       │                        │                        │
       │                        │ 5. Frontend polls      │
       │                        │ <──────────────────────┤
       │                        │    getEvents({         │
       │                        │      contractIds: [...],
       │                        │      startLedger: 1000  │
       │                        │    })                  │
       │                        │                        │
       │                        │ 6. Return events       │
       │                        ├──────────────────────> │
       │                        │    [DonationReceived]  │
       │                        │                        │
       │                        │                        │ 7. Update UI
       │                        │                        │    Show donation
       │                        │                        │    Update balance
       │                        │                        │
```

### Event Types & Usage

| Event | Purpose | Consumers |
|-------|---------|-----------|
| **DonationReceived** | Track donations | Donor dashboard, Campaign stats, Audit trail |
| **CampaignCreated** | Campaign registry | Campaign list, Admin dashboard |
| **BeneficiaryWhitelisted** | Access control | NGO dashboard, Beneficiary notification |
| **FundsAllocated** | Fund tracking | Beneficiary wallet, NGO dashboard |
| **SpendingAuthorized** | Transaction init | Beneficiary history, Merchant dashboard |
| **TransactionExecuted** | Payment confirmation | All dashboards, Audit trail |
| **MerchantRegistered** | Merchant registry | Merchant list, NGO dashboard |

---

## Security & Validation Flow

### Multi-Layer Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                   VALIDATION LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LAYER 1: Frontend Validation (UX)                               │
│  ├─ Input validation (amount > 0, address format)                │
│  ├─ Balance check (sufficient funds)                             │
│  ├─ Wallet connection check                                      │
│  └─ Show user-friendly errors                                    │
│                                                                   │
│  LAYER 2: Wallet Signature (Authorization)                       │
│  ├─ User must approve in Freighter                               │
│  ├─ Transaction signed with private key                          │
│  ├─ User explicitly authorizes action                            │
│  └─ Prevents unauthorized transactions                           │
│                                                                   │
│  LAYER 3: Smart Contract Validation (Security)                   │
│  ├─ Role verification (admin, NGO, beneficiary)                  │
│  ├─ Whitelist checks (beneficiary, merchant)                     │
│  ├─ Balance sufficiency (campaign, beneficiary)                  │
│  ├─ Category limit enforcement                                   │
│  ├─ Authorization existence & status                             │
│  └─ Revert transaction if any check fails                        │
│                                                                   │
│  LAYER 4: Blockchain Consensus (Integrity)                       │
│  ├─ Transaction validated by Stellar validators                  │
│  ├─ State changes are atomic                                     │
│  ├─ Immutable record on ledger                                   │
│  └─ Cannot be tampered with                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Authorization Flow

```
EXAMPLE: Spending Authorization Request

Step 1: Role Check
──────────────────
Question: Who is calling authorize_spending()?
Answer: Must be beneficiary (self) or authorized caller
Logic: env.invoker() == beneficiary OR env.invoker() in authorized_callers
Result: ✓ PASS → Continue | ✗ FAIL → Revert with Unauthorized

Step 2: Whitelist Check
───────────────────────
Question: Is beneficiary whitelisted?
Answer: Query BeneficiaryRegistry.is_whitelisted(beneficiary)
Result: ✓ PASS → Continue | ✗ FAIL → Revert with BeneficiaryNotWhitelisted

Step 3: Merchant Check
──────────────────────
Question: Is merchant approved for this category?
Answer: Query MerchantRegistry.is_approved_for_category(merchant, category)
Result: ✓ PASS → Continue | ✗ FAIL → Revert with MerchantNotApproved

Step 4: Balance Check
─────────────────────
Question: Does beneficiary have sufficient allocation?
Answer: beneficiary_allocations[beneficiary] >= amount
Result: ✓ PASS → Continue | ✗ FAIL → Revert with InsufficientBalance

Step 5: Category Limit Check
─────────────────────────────
Question: Is category spending within limit?
Answer: 
  spent = category_spent[beneficiary][category]
  limit = category_limits[beneficiary][category]
  spent + amount <= limit
Result: ✓ PASS → Create authorization | ✗ FAIL → Revert with CategoryLimitExceeded

Step 6: Create Authorization
─────────────────────────────
All checks passed → Create authorization record with unique ID
Emit SpendingAuthorized event
Return authorization ID to caller
```

---

## Quick Reference

### System Flow Summary

1. **Setup**: Admin deploys contracts, creates campaigns, registers merchants
2. **Fundraising**: Donors contribute USDC to campaigns
3. **Allocation**: NGOs whitelist beneficiaries and allocate funds with category limits
4. **Spending**: Beneficiaries request spending, merchants fulfill orders, payments execute
5. **Audit**: Anyone can view complete transaction history on public explorer

### Key Principles

- ✅ **On-chain enforcement**: All rules enforced by smart contracts, not frontend
- ✅ **Event-driven**: Every action emits events for transparency
- ✅ **Multi-signature**: All transactions require user approval via wallet
- ✅ **Immutable audit**: Blockchain provides permanent record
- ✅ **Public transparency**: Anyone can view transactions without authentication

### Critical Validations

| Operation | Validations |
|-----------|-------------|
| **donate()** | Campaign exists, amount > 0, USDC balance sufficient |
| **allocate_to_beneficiary()** | Caller is NGO, beneficiary whitelisted, campaign balance sufficient |
| **authorize_spending()** | Beneficiary whitelisted, merchant approved for category, allocation sufficient, category limit not exceeded |
| **execute_spending()** | Authorization exists, status is Pending, not already executed |

---

**End of Project Flow Documentation**

Ready to build? Follow [STEPS.md](./STEPS.md) for implementation! 🚀
