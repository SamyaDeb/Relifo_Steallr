# 🚀 Relifo Complete Testing Checklist

**Version:** 1.0.0  
**Date:** January 15, 2026  
**Status:** ✅ READY FOR TESTING

---

## 📋 Quick Start - Testing the Full Flow

### Prerequisites Setup (5 minutes)

1. **Install Freighter Wallet**
   - Chrome/Firefox extension
   - Create 5 test accounts (Admin, NGO, Donor, Beneficiary, Merchant)
   - Switch network to TESTNET in Freighter settings

2. **Fund All Accounts** (IMPORTANT!)
   ```bash
   # Fund each account with friendbot
   curl -X POST "https://friendbot.stellar.org?addr=YOUR_ACCOUNT_ADDRESS"
   ```
   Accounts needed:
   - ✅ Admin: `GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT` (already funded)
   - 🆕 NGO Account (create new)
   - 🆕 Donor Account (create new)
   - 🆕 Beneficiary Account (create new)
   - 🆕 Merchant Account (create new)

3. **Start Services**
   ```bash
   # Terminal 1: Start MongoDB
   mongod
   
   # Terminal 2: Start Backend
   cd backend
   npm install
   npm start
   # Should see: "Server running on port 5000"
   
   # Terminal 3: Start Frontend
   cd frontend
   npm install
   npm run dev
   # Should see: "Ready on http://localhost:3000"
   ```

4. **Verify Environment**
   - ✅ MongoDB running: `mongodb://localhost:27017`
   - ✅ Backend running: `http://localhost:5000`
   - ✅ Frontend running: `http://localhost:3000`
   - ✅ Contract IDs in `.env.local`:
     - ReliefVault: `CASZUOUNIQK4X6QMFOE2D5VJQ7IITYYZCYLM3YW5ZHTXZ36UC7P6N4AZ`
     - NGORegistry: `CC5RCRQ3OZE5WIPRWJWMMJNJIYVNUIAECD7HPKBPJFNBJCZXSWTFU3QF`
     - BeneficiaryRegistry: `CBNVHYUZWK2SBD7KKP7V76JQXGD2SVIOUWQQ2HKWPUAQ42FAHUYYC7UG`
     - MerchantRegistry: `CBGZFHGLEOJGK42KGG2IZONWVK3OLYEYM5E56FUAB56H4XVAX3TMWKFP`

---

## 🎯 Complete Test Workflow (30-45 minutes)

### Phase 1: Admin Setup (5 minutes)

#### Test 1.1: Access Admin Dashboard
1. Open `http://localhost:3000`
2. Connect Freighter with admin address
3. Navigate to **Admin Dashboard** (should appear in menu)
4. **Verify:**
   - ✅ Dashboard loads
   - ✅ Shows system statistics
   - ✅ No errors in browser console (F12)

#### Test 1.2: Verify NGO
1. Switch to NGO account in Freighter
2. Register NGO:
   - Name: "Test Relief Org"
   - Description: "Providing humanitarian aid"
3. Switch back to admin account
4. Go to **Admin Dashboard** → **NGO Verification**
5. Click **Verify** on the new NGO
6. Approve transaction in Freighter
7. **Verify:**
   - ✅ Transaction appears on [Stellar Explorer](https://stellar.expert/explorer/testnet)
   - ✅ NGO status changes to "Verified"
   - ✅ NGO appears in verified list

#### Test 1.3: Approve Merchant
1. Switch to merchant account in Freighter
2. Register Merchant:
   - Business Name: "Community Food Store"
   - Category: "Food"
   - Description: "Local grocery"
3. Switch back to admin account
4. Go to **Merchant Registry** → **Pending Approvals**
5. Click **Approve** on the merchant
6. Select categories: **Food**, **Healthcare**
7. Approve transaction in Freighter
8. **Verify:**
   - ✅ Transaction succeeds
   - ✅ Merchant status: "Approved"
   - ✅ Categories saved correctly

**✅ Phase 1 Complete - Admin setup done!**

---

### Phase 2: Campaign Creation & Donation (10 minutes)

#### Test 2.1: NGO Creates Campaign
1. Switch to verified NGO account
2. Go to **NGO Dashboard** → **Create Campaign**
3. Fill form:
   - Title: "Winter Relief 2026"
   - Category: "Food"
   - Target: **10000 USDC**
   - Description: "Providing food for displaced families"
   - Location: "Test Region"
   - End Date: (1 month from now)
4. Click **Create Campaign**
5. Approve transaction in Freighter
6. **Verify:**
   - ✅ Campaign ID generated
   - ✅ Campaign appears in campaign list
   - ✅ Initial balance: 0 USDC
   - ✅ Status: "Active"
   - ✅ Visible on blockchain explorer
   - ✅ Backend API shows campaign: `GET http://localhost:5000/api/campaigns`

#### Test 2.2: Donor Makes First Donation
1. Switch to donor account in Freighter
2. Go to **Campaigns** (from main menu)
3. Find "Winter Relief 2026" campaign
4. Click **Donate**
5. Enter amount: **6000 USDC**
6. Click **Confirm Donation**
7. Approve transaction in Freighter
8. **Verify:**
   - ✅ Transaction succeeds
   - ✅ Campaign raised amount: **6000 USDC**
   - ✅ Progress bar: 60%
   - ✅ Donor count increases by 1
   - ✅ Transaction in donation history
   - ✅ Real-time update (no page refresh needed)

#### Test 2.3: Second Donor Completes Target
1. Create/switch to second donor account
2. Fund it with friendbot
3. Navigate to same campaign
4. Donate: **4000 USDC**
5. **Verify:**
   - ✅ Campaign raised amount: **10000 USDC**
   - ✅ Progress bar: 100%
   - ✅ Target reached indicator shows
   - ✅ Both donations visible in history

**✅ Phase 2 Complete - Campaign funded!**

---

### Phase 3: Beneficiary Application & Approval (10 minutes)

#### Test 3.1: Beneficiary Applies for Aid
1. Switch to beneficiary account in Freighter
2. Go to **Beneficiary Dashboard** → **Available Campaigns**
3. Find "Winter Relief 2026"
4. Click **Apply for Aid**
5. Fill application:
   - Details: "Single parent with 2 children, need food support"
   - Household size: 3
6. Submit application
7. Approve transaction in Freighter
8. **Verify:**
   - ✅ Application submitted
   - ✅ Status: "Pending Review"
   - ✅ Application ID generated
   - ✅ Backend syncs: `GET http://localhost:5000/api/beneficiaries/applications/:campaignId`

#### Test 3.2: NGO Reviews and Approves
1. Switch to NGO account
2. Go to **NGO Dashboard** → **Applications**
3. Click on pending application
4. Review details
5. Click **Approve Application**
6. Set category limits:
   - Food: **1500 USDC**
   - Healthcare: **500 USDC**
   - Education: **0 USDC**
   Total: **2000 USDC**
7. Approve transaction in Freighter
8. **Verify:**
   - ✅ Transaction succeeds
   - ✅ Application status: "Approved"
   - ✅ Campaign balance decreases: **8000 USDC** remaining
   - ✅ Beneficiary allocated: **2000 USDC**

#### Test 3.3: Beneficiary Checks Allocation
1. Switch to beneficiary account
2. Go to **My Allocations**
3. **Verify:**
   - ✅ Total allocation: **2000 USDC**
   - ✅ Food category: **1500 USDC** available
   - ✅ Healthcare: **500 USDC** available
   - ✅ Education: **0 USDC**
   - ✅ Spent amounts all: **0 USDC**
   - ✅ Data from blockchain (not mock)

**✅ Phase 3 Complete - Beneficiary approved with funds!**

---

### Phase 4: Direct Spending (10 minutes)

#### Test 4.1: Beneficiary Selects Merchant
1. Stay in beneficiary account
2. Go to **Direct Spending**
3. Select category: **Food**
4. **Verify:**
   - ✅ Merchant list loads
   - ✅ "Community Food Store" appears
   - ✅ Merchant details visible
   - ✅ Categories shown
   - ✅ Data from blockchain

#### Test 4.2: Authorize and Execute Payment
1. Select "Community Food Store"
2. Enter amount: **500 USDC**
3. Confirm category: **Food**
4. Click **Authorize Payment**
5. Review transaction details
6. Approve in Freighter
7. **Verify:**
   - ✅ Authorization transaction succeeds
   - ✅ Execution transaction succeeds
   - ✅ Spending recorded on-chain
   - ✅ Food balance updates: **1000 USDC** remaining (1500 - 500)
   - ✅ Total available: **1500 USDC** (2000 - 500)

#### Test 4.3: Test Category Limit Enforcement
1. Try to spend **1200 USDC** from Food category
2. **Verify:**
   - ✅ Error message: "Exceeds remaining balance"
   - ✅ Transaction rejected
   - ✅ Balance unchanged

#### Test 4.4: Merchant Receives Payment
1. Switch to merchant account
2. Go to **Merchant Dashboard** → **Orders**
3. **Verify:**
   - ✅ New order appears
   - ✅ Amount: **500 USDC**
   - ✅ Beneficiary address shown
   - ✅ Category: Food
   - ✅ Status: "Completed"
   - ✅ Timestamp displayed
   - ✅ Total received increases

**✅ Phase 4 Complete - Full spending flow works!**

---

### Phase 5: Data Verification & Consistency (5 minutes)

#### Test 5.1: Backend API Verification
Open terminal and test all endpoints:

```bash
# Test campaigns endpoint
curl http://localhost:5000/api/campaigns | jq

# Test specific campaign
curl http://localhost:5000/api/campaigns/CAMPAIGN_ID | jq

# Test merchants by category
curl http://localhost:5000/api/merchants/category/Food | jq

# Test beneficiary applications
curl http://localhost:5000/api/beneficiaries/applications/CAMPAIGN_ID | jq

# Test transactions
curl http://localhost:5000/api/transactions/wallet/BENEFICIARY_ADDRESS | jq
```

**Verify:**
- ✅ All endpoints return data
- ✅ No mock data in responses
- ✅ Data matches blockchain state
- ✅ Proper JSON structure

#### Test 5.2: Blockchain Verification
1. Go to [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)
2. Search for each contract ID:
   - ReliefVault: `CASZUOUNIQK4X6QMFOE2D5VJQ7IITYYZCYLM3YW5ZHTXZ36UC7P6N4AZ`
   - NGORegistry: `CC5RCRQ3OZE5WIPRWJWMMJNJIYVNUIAECD7HPKBPJFNBJCZXSWTFU3QF`
   - BeneficiaryRegistry: `CBNVHYUZWK2SBD7KKP7V76JQXGD2SVIOUWQQ2HKWPUAQ42FAHUYYC7UG`
   - MerchantRegistry: `CBGZFHGLEOJGK42KGG2IZONWVK3OLYEYM5E56FUAB56H4XVAX3TMWKFP`
3. **Verify:**
   - ✅ All contracts show transactions
   - ✅ Operations match your actions
   - ✅ Events emitted correctly
   - ✅ State changes recorded

#### Test 5.3: Real-Time Updates
1. Open browser in split view (or 2 windows)
2. Window 1: Logged in as donor, viewing campaign
3. Window 2: Logged in as another donor
4. Make donation in Window 2
5. **Verify:**
   - ✅ Window 1 updates automatically
   - ✅ Campaign balance increases
   - ✅ Progress bar updates
   - ✅ No page refresh needed

**✅ Phase 5 Complete - Data consistency verified!**

---

## 🔍 Final Verification Checklist

### Smart Contracts
- [x] All 4 contracts deployed to testnet
- [x] All contracts initialized
- [x] Contract IDs saved in .env files
- [ ] All contract functions tested and working
- [ ] Access control verified (admin-only functions)
- [ ] State changes persisted on blockchain
- [ ] Events emitted for all operations
- [ ] No errors in contract calls

### Frontend
- [ ] Wallet connection stable
- [ ] All 5 user dashboards accessible
- [ ] Transaction signing working
- [ ] Real-time data updates
- [ ] No mock data anywhere
- [ ] Loading states work
- [ ] Error handling graceful
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable

### Backend
- [ ] All API endpoints working
- [ ] MongoDB connection stable
- [ ] Data syncs from blockchain
- [ ] CORS configured properly
- [ ] Error responses helpful
- [ ] No data loss
- [ ] Queries efficient

### Integration
- [ ] End-to-end flow completes
- [ ] Cross-contract calls work
- [ ] Data consistency maintained
- [ ] Concurrent operations handled
- [ ] Edge cases handled
- [ ] Security measures active

---

## 📊 Test Results Summary

### Core Functionality
| Feature | Status | Notes |
|---------|--------|-------|
| NGO Registration | ⏳ Test | Admin verification required |
| Campaign Creation | ⏳ Test | Verified NGO only |
| Donations | ⏳ Test | Balance updates real-time |
| Beneficiary Application | ⏳ Test | Application queue |
| Beneficiary Approval | ⏳ Test | Category limits enforced |
| Direct Spending | ⏳ Test | Authorization + execution |
| Merchant Registration | ⏳ Test | Admin approval needed |
| Payment Processing | ⏳ Test | Merchant receives funds |

### Data Integrity
| Aspect | Status | Notes |
|--------|--------|-------|
| Blockchain State | ⏳ Test | Verifiable on explorer |
| Backend Sync | ⏳ Test | API matches chain |
| Real-time Updates | ⏳ Test | No page refresh needed |
| Transaction History | ⏳ Test | Complete and accurate |

### Security
| Check | Status | Notes |
|-------|--------|-------|
| Wallet Authentication | ⏳ Test | Freighter integration |
| Role-based Access | ⏳ Test | Admin, NGO, etc. |
| Transaction Approval | ⏳ Test | User confirms all txs |
| Input Validation | ⏳ Test | Form validation works |

---

## 🐛 Common Issues & Solutions

### Issue: "Transaction Failed"
**Solutions:**
1. Check XLM balance (need ~1 XLM for fees)
2. Verify network is TESTNET in Freighter
3. Ensure contract IDs are correct in .env.local
4. Check browser console for detailed error

### Issue: "No Campaigns Loading"
**Solutions:**
1. Verify backend is running: `http://localhost:5000/api/campaigns`
2. Check MongoDB is running
3. Clear browser cache
4. Check network tab for API errors

### Issue: "Wallet Won't Connect"
**Solutions:**
1. Ensure Freighter is installed and unlocked
2. Switch to TESTNET network
3. Refresh page and try again
4. Check console for Freighter errors

### Issue: "Data Not Updating"
**Solutions:**
1. Verify transaction succeeded on blockchain
2. Wait 3-5 seconds for confirmation
3. Check backend is syncing
4. Manually refresh if needed

---

## 🎉 Success Criteria

### Minimum Viable Test
To consider the system working, you must successfully:
1. ✅ Register and verify an NGO
2. ✅ Create a campaign
3. ✅ Make a donation
4. ✅ Apply and approve beneficiary
5. ✅ Execute a payment to merchant
6. ✅ Verify all data on blockchain

### Full System Test
For production readiness:
1. ✅ All 8 core features working
2. ✅ All 4 contracts operational
3. ✅ Real-time updates functioning
4. ✅ No mock data anywhere
5. ✅ Error handling comprehensive
6. ✅ Security measures active
7. ✅ Performance acceptable
8. ✅ Mobile responsive

---

## 📝 Test Report Template

```markdown
# Relifo Test Report

**Date:** ________________
**Tester:** ________________
**Duration:** ________________

## Test Environment
- Frontend: http://localhost:3000 ✅/❌
- Backend: http://localhost:5000 ✅/❌
- MongoDB: Running ✅/❌
- Freighter: Connected ✅/❌

## Test Accounts Used
- Admin: GBDD6... ✅
- NGO: _______ ✅/❌
- Donor: _______ ✅/❌
- Beneficiary: _______ ✅/❌
- Merchant: _______ ✅/❌

## Test Results
### Phase 1: Admin Setup
- [✅/❌] Admin Dashboard Access
- [✅/❌] NGO Verification
- [✅/❌] Merchant Approval

### Phase 2: Campaign & Donations
- [✅/❌] Campaign Creation
- [✅/❌] First Donation
- [✅/❌] Second Donation

### Phase 3: Beneficiary Flow
- [✅/❌] Application Submission
- [✅/❌] NGO Approval
- [✅/❌] Allocation Check

### Phase 4: Spending
- [✅/❌] Merchant Selection
- [✅/❌] Payment Execution
- [✅/❌] Limit Enforcement
- [✅/❌] Merchant Receipt

### Phase 5: Verification
- [✅/❌] API Verification
- [✅/❌] Blockchain Verification
- [✅/❌] Real-time Updates

## Issues Found
1. ________________________
2. ________________________
3. ________________________

## Blockchain Transactions
- Campaign Creation: [TX HASH]
- First Donation: [TX HASH]
- Beneficiary Approval: [TX HASH]
- Payment Execution: [TX HASH]

## Overall Result
- Status: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
- Confidence Level: High / Medium / Low
- Production Ready: Yes / No / With Fixes

## Notes
_____________________________________
_____________________________________
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ Document any minor issues
   - ✅ Prepare for user acceptance testing
   - ✅ Plan mainnet deployment
   - ✅ Set up monitoring

2. **If Tests Fail:**
   - 🐛 Document failures in detail
   - 🔧 Fix critical bugs
   - 🔄 Re-test after fixes
   - 📝 Update documentation

3. **Always:**
   - 📊 Review test results with team
   - 📸 Take screenshots of successful flows
   - 🎥 Record demo video
   - 📚 Update documentation

---

**Good luck with testing! 🎉**

For support: Check logs, blockchain explorer, and backend API responses.
