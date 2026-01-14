# 🏆 Relifo - Hackathon Demo Script

**Duration**: 15 minutes  
**Network**: Stellar Testnet  
**Judges Focus**: Beneficiary self-registration + NGO approval workflow

---

## 🎬 Demo Flow (7 Minutes Live)

### Pre-Demo Setup (Do Before Presentation)
1. Deploy all 3 contracts to Stellar testnet
2. Test the complete flow yourself:
   - Create admin wallet → verify it works
   - Create NGO account → get it verified
   - Create campaign: "Turkey Earthquake Relief"
   - Create donor wallet → get testnet XLM + USDC → donate
   - Create beneficiary wallet → apply → get approved
3. Have beneficiary application documents ready (photos, ID)
4. Clear all test data (or use fresh wallets for presentation)
5. Open 4 browser tabs:
   - Tab 1: Donor dashboard
   - Tab 2: NGO dashboard
   - Tab 3: Beneficiary application form
   - Tab 4: Public audit explorer

---

## 📊 Presentation Outline

### SLIDE 1: Problem (30 seconds)
**Traditional disaster relief is broken:**
- ⏰ Takes 7-14 days to reach victims
- 💸 30% lost to middlemen and corruption
- 🚫 No transparency - donors don't know where money goes
- 🏦 Requires bank accounts - refugees can't access

**Real Example**: Haiti earthquake 2010 - $9B donated, only $4B reached victims.

---

### SLIDE 2: Solution - Relifo (30 seconds)
**Blockchain-powered transparent relief with flexible controls:**
- 💰 **USDC Stablecoin**: Industry-standard, backed by real USD reserves
- ⚡ Funds reach victims in < 1 hour (not 7-14 days)
- 🎛️ **Optional Controls**: NGOs choose Rapid Relief (autonomy) or Controlled Relief (oversight)
- 🔍 100% transparent on public blockchain
- 💸 < 2% fees (just blockchain costs, no middlemen)
- 📱 Donors own wallet, full USDC balance control
- 🌍 Production: Fiat on-ramps (MoneyGram, card, bank) → USDC → Donate

---

### SLIDE 3: Unique Innovation (30 seconds)
**What makes Relifo different:**
1. **Beneficiary Self-Registration**: Victims apply directly with documents
2. **NGO Approval Workflow**: Real-time document verification on blockchain
3. **Optional Spending Controls**: Choose Rapid Relief (emergencies) or Controlled Relief (programs)
4. **Audit Trail**: Every transaction public and traceable
5. **USDC stablecoin**: Direct USDC transfers, no custom token or minting needed

**Not just "stablecoin payments" - we solve verification + offer flexibility!**

---

### LIVE DEMO: Part 1 - Donation (1 minute)

**Tab 1: Donor Dashboard**

```
ACTIONS:
1. Click "Connect Wallet"
   - Freighter opens
   - Approve connection
   "This is our donor, Sarah, connecting her wallet"

2. Click "Connect Wallet" (Freighter)
   - Freighter opens
   - Select Stellar testnet network
   - Approve connection
   "Sarah connects her own Stellar wallet. She controls it."

3. Click "Add Balance" in Wallet Section
   - Choice 1: "Get Testnet USDC" (faucet)
     ├─ Click faucet button
     ├─ Instant: 100 USDC received
     └─ "Fastest way to get testnet USDC"
   - Choice 2: "Swap XLM to USDC" (DEX)
     ├─ Click "Swap XLM to USDC" option
     ├─ View balance: 1000 XLM (from Friendbot)
     ├─ Enter swap amount: 100 XLM
     ├─ See conversion: 100 XLM → ~100 USDC
     ├─ Click "Execute Swap"
     ├─ Freighter prompts for Stellar DEX approval
     ├─ Sign transaction (~5 seconds)
     ├─ Swap completes
     └─ "Real on-chain swap, shows donor flexibility"
   "Sarah can choose: quick faucet OR real XLM swap (more realistic)."

4. Donor Dashboard Shows:
   - Wallet address: GABC...XYZ
   - Account Balance: 100 USDC (from faucet or swap)
   - Transaction history shows swap or faucet operation
   - "Ready to donate" message
   "Sarah's balance is always visible. Real-time updates."

5. Click "Browse Campaigns"
   - See "Earthquake Relief" campaign
   - Total raised: 500 USDC
   - Click to view details
   "Click to see the campaign Sarah wants to support."

6. Click "Donate"
   - Enter amount: 50 USDC
   - Preview shows:
     ├─ From: Sarah's wallet
     ├─ Amount: 50 USDC
     ├─ New balance after: 50 USDC
     └─ Fee: ~$0.0001
   - Click "Confirm Donation"
   - Freighter prompts to sign
   - Sarah approves
   "5 seconds... blockchain processes the donation."

7. Success!
   - Dashboard updates: 100 USDC → 50 USDC
   - Campaign total: 500 → 550 USDC
   - Can view transaction on Stellar explorer
   "Real donation on testnet. Transparent. Immutable. Complete."
   - Swap executed: 100 XLM → 100 RLFC
   - Receive 100 RLFC instantly
   "In production, MoneyGram converts fiat → XLM → RLFC"
   "On testnet, users swap XLM they got from Friendbot"

3. See wallet balance: 100 RLFC (9,900 XLM remaining for fees)
   "She sees 'Turkey Earthquake Relief' by RedCross NGO"
   
3. Click campaign → Show details:
   - Goal: $10,000
   - Raised so far: $2,300
   - Beneficiaries helped: 0 (campaign just started)
   - Control Mode: DIRECT (full autonomy)

4. Click "Donate" → Enter 100 USDC
   
5. Sign transaction with Freighter
   "Transaction processes in ~5 seconds on Stellar"
   
6. ✅ Success! Campaign balance: $2,300 → $2,400
```

**KEY MESSAGE**: "Instant, transparent donation. No intermediaries."

---

### LIVE DEMO: Part 2 - Beneficiary Registration (2 minutes)

**Tab 3: Beneficiary Application Page**

```
ACTIONS:
1. Show beneficiary perspective
   "This is Ahmed, a father of 3 in Gaziantep, Turkey"
   "His home was damaged in the earthquake"

2. Browse active campaigns → Click "Apply for Relief"

3. Fill application form:
   - Name: Ahmed Yilmaz
   - National ID: TR123456789
   - Location: Gaziantep, Turkey
   - Family size: 5
   - Need description: "Home destroyed, need food and shelter"
   
4. Upload documents:
   - National ID photo (show preview)
   - Damaged home photo (show preview)
   - Location verification
   
5. Create/connect Stellar wallet
   "Ahmed gets a free Stellar wallet - no bank needed"
   
6. Click "Submit Application"
   
7. ✅ Application ID: #12345
   "Documents hashed and stored on blockchain"
   "Status: PENDING REVIEW"
```

**KEY MESSAGE**: "Victims have agency - they apply directly with proof."

---

### LIVE DEMO: Part 3 - NGO Approval (2 minutes)

**Tab 2: NGO Dashboard**

```
ACTIONS:
1. Switch to NGO view (RedCross operator)
   "NGOs receive applications in real-time"

2. Click "Applications" tab
   Show list:
   - #12345 - Ahmed Yilmaz - PENDING (just submitted)
   - #12344 - Sara Khan - APPROVED
   - #12343 - John Doe - REJECTED (outside area)

3. Click Ahmed's application (#12345)
   Show full details:
   - Personal information
   - Family details
   - Location map
   - Uploaded documents

4. Click "View Documents"
   - ID verification: ✓ Authentic
   - Location: ✓ Gaziantep (eligible)
   - Damage proof: ✓ Verified
   
5. Decision: APPROVE
   
6. Set allocation: $200 USDC
   
7. Click "Approve & Allocate"
   
8. Sign transaction with Freighter
   
9. ✅ Status: APPROVED
   Blockchain event: BeneficiaryApproved
   Blockchain event: FundsAllocated ($200 to Ahmed)
```

**KEY MESSAGE**: "NGOs verify documents, blockchain ensures accountability."

---

### LIVE DEMO: Part 4 - Beneficiary Spending (1 minute)

**Tab 3: Beneficiary Dashboard**

```
ACTIONS:
1. Refresh beneficiary view
   "Ahmed receives instant notification"

2. Show wallet dashboard:
   - Status: APPROVED ✅
   - Allocated: $200 USDC
   - Spent: $0
   - Available: $200
   - Mode: DIRECT (full control)

3. Click "Spend Funds"
   
4. Show spending options:
   - ✅ Send to merchant (QR code)
   - ✅ Send to individual
   - ✅ Cash out via MoneyGram (production)
   - ✅ Buy goods online
   
5. Example: Send $50 to local grocery store
   - Enter merchant address
   - Add memo: "Groceries for family"
   - Sign transaction
   
6. ✅ Transaction complete
   - Available: $200 → $150
   - Transaction visible on blockchain
```

**KEY MESSAGE**: "Full autonomy - Ahmed decides how to spend. No middlemen."

---

### LIVE DEMO: Part 5 - Public Audit Trail (1 minute)

**Tab 4: Public Audit Explorer**

```
ACTIONS:
1. Show audit explorer (no login required)
   "Anyone can verify fund usage"

2. Filter by campaign: "Turkey Earthquake Relief"

3. Show complete transaction history:
   ┌─────────────────────────────────────────────┐
   │ Donation: Sarah → Campaign    $100    ✅   │
   │ Application: Ahmed → Campaign  REG    ✅   │
   │ Approval: NGO → Ahmed         APR    ✅   │
   │ Allocation: Campaign → Ahmed   $200   ✅   │
   │ Spending: Ahmed → Merchant    $50    ✅   │
   └─────────────────────────────────────────────┘

4. Click any transaction → Show details:
   - Transaction hash
   - Timestamp
   - Amount
   - Source/destination
   - Stellar explorer link
   - Document hash (for applications)

5. Show campaign metrics:
   - Total donated: $2,400
   - Total allocated: $200
   - Beneficiaries: 1 approved
   - Average processing time: 8 minutes
```

**KEY MESSAGE**: "100% transparent. Zero corruption. Every dollar tracked."

---

## 🎤 Q&A Preparation (Common Questions)

### Q: "Why not just use traditional wire transfers?"
**A**: Wire transfers take 7-14 days and require bank accounts. In disasters:
- Refugees don't have banks
- Speed matters - people need food NOW
- 30% is lost to middlemen
- Zero transparency - you can't track wire transfers

### Q: "How do you prevent fraud in beneficiary registration?"
**A**: Three layers:
1. Document verification by NGO (ID, location proof, damage photos)
2. Blockchain audit trail (every approval is public)
3. NGOs are verified by admin before they can approve beneficiaries

### Q: "What if beneficiaries spend on wrong things?"
**A**: Direct Mode (default) gives full autonomy because:
- Emergencies need speed, not bureaucracy
- Beneficiaries know their needs better than anyone
- Transparency ensures accountability (all spending is public)
- For high-oversight cases, we have optional Controlled Mode

### Q: "How does MoneyGram integration work?"
**A**: Production version:
- Donors: Cash/card → MoneyGram API → USDC → Stellar wallet
- Beneficiaries: USDC → MoneyGram API → local currency cash
- Available in 200+ countries
- KYC/AML compliant
- This demo uses testnet USDC, production would use MoneyGram

### Q: "What's your business model?"
**A**: 
- Free for beneficiaries and donors
- NGOs pay small platform fee (1-2%)
- Still 90% cheaper than traditional relief
- Sustainable and scales globally

### Q: "Can this work without internet/smartphones?"
**A**: 
- SMS integration for basic wallet (future)
- MoneyGram locations for cash-out (200+ countries)
- NGOs can distribute on behalf of beneficiaries
- But most disaster areas have mobile networks today

---

## 📈 Impact Metrics to Highlight

### Speed Comparison
```
Traditional Relief: 7-14 days
Relifo:            < 1 hour
Improvement:       168x faster
```

### Cost Comparison
```
Traditional Relief: 30% overhead
Relifo:            < 2% (blockchain fees only)
Improvement:       15x more efficient
```

### Transparency
```
Traditional Relief: 0% visibility
Relifo:            100% public audit trail
```

### Global Reach
```
MoneyGram: 200+ countries
Stellar:   Fast, cheap transactions
Result:    Anyone, anywhere can help
```

---

## 🎯 Closing Statement (30 seconds)

"Traditional disaster relief is broken. Relifo fixes it with blockchain.

We're not just sending stablecoins - we're solving the HARD problem: how do you verify victims are real, approve them quickly, and give them autonomy while maintaining transparency?

Our innovation is the **beneficiary self-registration + NGO approval workflow**. On blockchain. Public. Fast. Transparent.

In the next disaster, donors shouldn't have to trust NGOs. They should be able to VERIFY where every dollar goes.

That's Relifo. Thank you."

---

## ✅ Pre-Demo Checklist

**48 Hours Before:**
- [ ] All 3 smart contracts deployed to testnet
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Backend API endpoint `/api/usdc/purchase` working
- [ ] Buy USDC flow tested (automatically handles XLM + trustline)
- [ ] Test entire flow with fresh wallets 3 times
- [ ] Verify all features: purchase, donate, register, approve, allocate, spend
- [ ] Document any issues and fix them

**6 Hours Before:**
- [ ] Verify frontend is live and accessible
- [ ] Test Freighter wallet connection flow
- [ ] Test Friendbot API (not rate-limited)
- [ ] Test USDC faucet endpoint works
- [ ] Prepare beneficiary documents (photos ready)
- [ ] Clear browser cache
- [ ] Test full flow on presentation laptop with NEW wallets

**30 Minutes Before:**
- [ ] Open 4 browser tabs (Donor, NGO, Beneficiary, Audit)
- [ ] Connect all wallets
- [ ] Have Stellar testnet explorer ready
- [ ] Load pitch deck
- [ ] Test projector/screen share
- [ ] Deep breath - you've got this! 🚀

---

## 🎨 Visual Demo Tips

1. **Use Large Fonts**: Judges sit far away
2. **Highlight Key Transactions**: Use browser dev tools to add visual indicators
3. **Show Toast Notifications**: Real-time feedback makes it feel responsive
4. **Use Testnet Explorer**: Open Stellar testnet explorer for each transaction
5. **Show Loading States**: Even on testnet, show "Processing..." for realism
6. **Pre-load Images**: Don't upload documents during demo (have them ready)
7. **Use QR Codes**: Visual QR code for wallet addresses looks professional
8. **Color Code Roles**: Green for donor, Blue for NGO, Orange for beneficiary

---

## 🐛 Backup Plan (If Demo Fails)

**If blockchain is slow:**
- Have a pre-recorded video showing the exact flow
- Show local testing results
- Walk through code and explain architecture

**If wallet doesn't connect:**
- Use a pre-connected session (screenshot)
- Fall back to video demo
- Show contract code instead

**If you run out of time:**
- Skip MoneyGram explanation (it's in slides)
- Focus on beneficiary registration (your unique value)
- End with audit trail (shows transparency)

---

Good luck! Remember: **Judges care about innovation, not perfection.** Your unique value is the beneficiary self-registration workflow. Focus on that! 🚀
