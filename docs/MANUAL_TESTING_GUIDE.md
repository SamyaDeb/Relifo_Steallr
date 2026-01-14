# Relifo Manual Testing Guide

**Testing Date:** January 15, 2026  
**Environment:** Stellar Testnet  
**Version:** 1.0.0

---

## 🎯 Prerequisites

### Required Tools
- ✅ Freighter Wallet installed and configured
- ✅ Multiple test accounts funded with XLM
- ✅ Test USDC tokens (optional, for full flow)
- ✅ MongoDB running locally
- ✅ Node.js 18+ installed

### Setup Steps

#### 1. Fund Test Accounts
```bash
# Fund each test account from Friendbot
curl -X POST "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

You'll need:
- 1 Admin account (already set up: `GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT`)
- 1 NGO account
- 1 Donor account
- 1 Beneficiary account
- 1 Merchant account

#### 2. Start Backend Server
```bash
cd backend
npm install
npm start
# Server should be running on http://localhost:5000
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend should be running on http://localhost:3000
```

#### 4. Connect Freighter Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve connection in Freighter
4. Verify your address appears in the header

---

## 🧪 Test Flow 1: Admin Workflow

### Test 1.1: Admin Dashboard Access
**Goal:** Verify admin can access admin-only features

1. Connect with admin wallet address: `GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT`
2. Navigate to `/admin/dashboard`
3. **Expected:** See system statistics, pending approvals, verification queue

**✅ Pass Criteria:**
- Dashboard loads without errors
- System stats display (Total Donations, Active Campaigns, etc.)
- Navigation shows admin-only links

### Test 1.2: NGO Verification
**Goal:** Approve a pending NGO

1. From admin dashboard, go to "NGO Verification"
2. View list of pending NGOs
3. Click "Verify" on a pending NGO
4. Approve transaction in Freighter
5. **Expected:** NGO status changes to "Verified"

**✅ Pass Criteria:**
- Transaction succeeds
- NGO appears in verified list
- Blockchain transaction visible on Stellar Explorer

### Test 1.3: Merchant Approval
**Goal:** Approve a pending merchant

1. From admin dashboard, go to "Merchant Registry"
2. View pending merchants
3. Click "Approve" on a merchant
4. Select categories to approve (Food, Healthcare, etc.)
5. Approve transaction in Freighter
6. **Expected:** Merchant status changes to "Approved"

**✅ Pass Criteria:**
- Transaction succeeds
- Merchant can now accept payments
- Category approvals saved correctly

---

## 🏢 Test Flow 2: NGO Workflow

### Test 2.1: NGO Registration
**Goal:** Register a new NGO

1. Switch to NGO account in Freighter
2. Navigate to `/ngo/register`
3. Fill in:
   - Organization Name: "Test Relief NGO"
   - Description: "Providing humanitarian aid"
   - Contact Email: "test@ngo.org"
4. Click "Register NGO"
5. Approve transaction in Freighter
6. **Expected:** Registration successful, status shows "Pending"

**✅ Pass Criteria:**
- Transaction succeeds
- Contract call to NGORegistry successful
- Status appears as "Pending Verification"
- Entry visible in backend API: `GET /api/ngos`

### Test 2.2: Create Campaign (After Verification)
**Goal:** Create a relief campaign

1. From verified NGO account, go to `/ngo/dashboard`
2. Click "Create Campaign"
3. Fill in:
   - Title: "Winter Relief 2026"
   - Category: "Food"
   - Target Amount: 10000 USDC
   - Description: "Providing food for displaced families"
4. Click "Create Campaign"
5. Approve transaction in Freighter
6. **Expected:** Campaign created with ID

**✅ Pass Criteria:**
- Transaction succeeds
- Campaign appears in campaign list
- Contract balance initialized
- Campaign visible on blockchain
- Backend syncs: `GET /api/campaigns`

### Test 2.3: Approve Beneficiary Application
**Goal:** Approve a beneficiary who applied

1. From NGO dashboard, click "Applications"
2. View pending applications for your campaign
3. Click on an application to review
4. Set category limits:
   - Food: 500 USDC
   - Healthcare: 300 USDC
   - Education: 200 USDC
5. Click "Approve Application"
6. Approve transaction in Freighter
7. **Expected:** Beneficiary approved with limits

**✅ Pass Criteria:**
- Transaction succeeds
- Beneficiary status changes to "Approved"
- Category limits saved on-chain
- Beneficiary can now receive allocations

---

## 💰 Test Flow 3: Donor Workflow

### Test 3.1: View Active Campaigns
**Goal:** Browse available campaigns

1. Connect with donor account
2. Navigate to `/donor/campaigns`
3. **Expected:** See list of active campaigns

**✅ Pass Criteria:**
- Campaigns load from blockchain/backend
- Campaign details displayed (title, target, raised, category)
- Progress bar shows correct percentage
- Real-time data (not mock data)

### Test 3.2: Make Donation
**Goal:** Donate to a campaign

1. Select a campaign
2. Click "Donate"
3. Enter amount: 100 USDC
4. Click "Confirm Donation"
5. Approve transaction in Freighter
6. **Expected:** Donation recorded, campaign balance increases

**✅ Pass Criteria:**
- Transaction succeeds
- Campaign raised amount increases by 100
- Transaction appears in donation history
- Blockchain event emitted
- Backend syncs: `GET /api/campaigns/:id`

### Test 3.3: View Donation History
**Goal:** See personal donation history

1. From donor dashboard, click "My Donations"
2. **Expected:** See list of all donations

**✅ Pass Criteria:**
- All donations listed with:
  - Campaign name
  - Amount
  - Date/time
  - Transaction hash
  - Status
- Data fetched from blockchain
- Correct total amount displayed

---

## 🆘 Test Flow 4: Beneficiary Workflow

### Test 4.1: Apply for Aid
**Goal:** Submit application for campaign

1. Connect with beneficiary account
2. Navigate to `/beneficiary/campaigns`
3. Select an active campaign
4. Click "Apply for Aid"
5. Fill in application details
6. Submit application
7. Approve transaction in Freighter
8. **Expected:** Application submitted, status "Pending"

**✅ Pass Criteria:**
- Transaction succeeds
- Application recorded on-chain
- Status shows "Pending Review"
- NGO can see application
- Backend syncs: `GET /api/beneficiaries/applications/:campaignId`

### Test 4.2: View Allocation (After Approval)
**Goal:** Check allocated funds

1. From beneficiary dashboard
2. Click "My Allocations"
3. **Expected:** See allocated amount and category limits

**✅ Pass Criteria:**
- Total allocated amount displayed
- Category breakdown shown:
  - Food: 500 USDC (example)
  - Healthcare: 300 USDC
  - Education: 200 USDC
- Spent amounts tracked
- Remaining balance calculated correctly

### Test 4.3: Direct Spending
**Goal:** Purchase from approved merchant

1. From beneficiary dashboard, click "Direct Spending"
2. Select category (e.g., "Food")
3. View approved merchants in that category
4. Select merchant
5. Enter amount: 50 USDC
6. Click "Authorize Payment"
7. Approve transaction in Freighter
8. **Expected:** Payment authorized and executed

**✅ Pass Criteria:**
- Merchant list loads from blockchain
- Authorization transaction succeeds
- Spending transaction executes
- Category balance decreases by 50
- Spent amount increases by 50
- Merchant receives payment notification
- Transaction visible on blockchain

---

## 🏪 Test Flow 5: Merchant Workflow

### Test 5.1: Merchant Registration
**Goal:** Register as merchant

1. Connect with merchant account
2. Navigate to `/merchant/register`
3. Fill in:
   - Business Name: "Community Food Store"
   - Category: "Food"
   - Description: "Local grocery store"
4. Click "Register"
5. Approve transaction in Freighter
6. **Expected:** Registration successful, status "Pending"

**✅ Pass Criteria:**
- Transaction succeeds
- Registration recorded on-chain
- Status shows "Pending Approval"
- Admin can see in approval queue

### Test 5.2: View Order Dashboard (After Approval)
**Goal:** See incoming payment requests

1. From merchant dashboard
2. Click "Orders"
3. **Expected:** See authorized payments from beneficiaries

**✅ Pass Criteria:**
- Order list displays:
  - Beneficiary address
  - Amount
  - Category
  - Status (Authorized/Completed)
  - Timestamp
- Real-time updates
- Data from blockchain

### Test 5.3: Fulfill Order
**Goal:** Complete a payment

1. Select an authorized payment
2. Click "Mark as Fulfilled"
3. Confirm in popup
4. **Expected:** Order marked complete

**✅ Pass Criteria:**
- Status updates to "Completed"
- Payment recorded in transaction history
- Merchant balance increases
- Beneficiary spending tracked

---

## 🔄 Test Flow 6: Cross-System Integration

### Test 6.1: End-to-End Campaign Flow
**Complete workflow from campaign creation to beneficiary spending**

1. **Admin:** Verify NGO
2. **NGO:** Create campaign (target: 1000 USDC)
3. **Donor:** Donate 500 USDC to campaign
4. **Donor:** Donate another 500 USDC (campaign reaches target)
5. **Beneficiary:** Apply for aid
6. **NGO:** Approve beneficiary (allocate 400 USDC)
7. **Admin:** Approve merchant
8. **Beneficiary:** Purchase from merchant (100 USDC)
9. **Merchant:** Fulfill order

**✅ Pass Criteria for Each Step:**
- All transactions succeed
- Balances update correctly:
  - Campaign: 1000 USDC raised → 400 allocated → 600 remaining
  - Beneficiary: 400 allocated → 100 spent → 300 remaining
  - Merchant: 100 received
- All state changes visible in real-time
- No mock data used anywhere
- Blockchain transactions verifiable

### Test 6.2: Real-Time Updates
**Goal:** Verify UI updates without refresh

1. Open same page in two browser windows
2. Connect different accounts in each
3. Perform transaction in window 1
4. **Expected:** Window 2 updates automatically

**✅ Pass Criteria:**
- Campaign balances update
- Status changes reflected
- Lists refresh with new data
- No page refresh needed

### Test 6.3: Error Handling
**Goal:** Verify graceful error handling

Test scenarios:
1. Try to donate 0 amount → Error shown
2. Try to spend more than allocated → Transaction fails with message
3. Disconnect wallet mid-transaction → Proper error message
4. Try to access unauthorized page → Redirected
5. Backend offline → Error message displayed

**✅ Pass Criteria:**
- All errors caught and displayed
- No application crashes
- User-friendly error messages
- Proper error logging

---

## 📊 Data Verification

### Blockchain Verification
For each transaction, verify on Stellar Expert:

1. Go to https://stellar.expert/explorer/testnet
2. Search for contract address or transaction hash
3. Verify:
   - Transaction succeeded
   - Correct function called
   - Correct parameters passed
   - Events emitted
   - State changes recorded

### Backend API Verification
Test all API endpoints:

```bash
# Get all campaigns
curl http://localhost:5000/api/campaigns

# Get campaign by ID
curl http://localhost:5000/api/campaigns/:id

# Get merchants by category
curl http://localhost:5000/api/merchants/category/Food

# Get beneficiary applications
curl http://localhost:5000/api/beneficiaries/applications/:campaignId

# Get transactions for wallet
curl http://localhost:5000/api/transactions/wallet/:address
```

**✅ Pass Criteria:**
- All endpoints return data
- No mock data in responses
- Data matches blockchain state
- Proper error responses for invalid requests

---

## 🔍 Edge Cases to Test

### 1. Insufficient Funds
- Try to allocate more than campaign has
- Try to spend more than beneficiary allocation
- Try transaction with insufficient XLM for fees

### 2. Unauthorized Access
- Try to verify NGO as non-admin
- Try to approve beneficiary as non-NGO
- Try to access admin pages as regular user

### 3. Concurrent Transactions
- Multiple donors donating simultaneously
- Multiple beneficiaries spending from same campaign
- NGO and beneficiary actions at same time

### 4. Boundary Values
- Donate exactly target amount
- Spend exactly allocated amount
- Create campaign with minimum/maximum values

### 5. State Transitions
- Try to donate to completed campaign
- Try to spend after allocation exhausted
- Try to verify already verified NGO

---

## 📝 Test Results Template

Copy and fill this out for each test session:

```
Date: _______________
Tester: _______________
Environment: Testnet
Frontend URL: http://localhost:3000
Backend URL: http://localhost:5000

Test Results:
□ Admin Workflow (3 tests)
  □ 1.1 Admin Dashboard Access
  □ 1.2 NGO Verification
  □ 1.3 Merchant Approval

□ NGO Workflow (3 tests)
  □ 2.1 NGO Registration
  □ 2.2 Create Campaign
  □ 2.3 Approve Beneficiary

□ Donor Workflow (3 tests)
  □ 3.1 View Campaigns
  □ 3.2 Make Donation
  □ 3.3 View History

□ Beneficiary Workflow (3 tests)
  □ 4.1 Apply for Aid
  □ 4.2 View Allocation
  □ 4.3 Direct Spending

□ Merchant Workflow (3 tests)
  □ 5.1 Registration
  □ 5.2 Order Dashboard
  □ 5.3 Fulfill Order

□ Integration Tests (3 tests)
  □ 6.1 End-to-End Flow
  □ 6.2 Real-Time Updates
  □ 6.3 Error Handling

Issues Found:
1. _______________
2. _______________
3. _______________

Overall Result: PASS / FAIL / PARTIAL
Notes: _______________
```

---

## ✅ Pre-Launch Checklist

Before considering production deployment:

### Smart Contracts
- [ ] All 4 contracts deployed and initialized
- [ ] Contract addresses saved in .env files
- [ ] All contract functions tested
- [ ] Access control verified
- [ ] Gas costs acceptable
- [ ] Event emissions working

### Frontend
- [ ] All 5 user dashboards functional
- [ ] Wallet connection stable
- [ ] Transaction signing working
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Real-time updates working

### Backend
- [ ] All API endpoints working
- [ ] MongoDB connection stable
- [ ] Data syncing from blockchain
- [ ] Error handling implemented
- [ ] CORS configured
- [ ] Environment variables set

### Integration
- [ ] End-to-end flow works
- [ ] Cross-contract calls succeed
- [ ] Real-time data displayed
- [ ] No mock data anywhere
- [ ] Blockchain events captured
- [ ] State consistency maintained

---

## 🚀 Next Steps

After successful testing:

1. **Document Issues:** Log all bugs found
2. **Performance Test:** Load test with multiple users
3. **Security Audit:** External security review
4. **User Acceptance:** Beta testing with real users
5. **Mainnet Prep:** Prepare for production deployment

---

**Happy Testing! 🎉**
