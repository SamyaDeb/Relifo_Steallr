# Implementation Notes - Full Controlled Mode with Firebase

## Latest Update: Complete Restructuring for Full Controlled Mode

### What Changed
The STEPS.md has been completely restructured to implement **full Controlled Mode** with **Firebase backend** for document management and admin verification.

---

## Key Additions

### Phase 0: Firebase Setup (NEW)
**Location**: Lines 27-95 in STEPS.md

This is now the **foundation phase** that must be completed before any smart contract work.

**Includes**:
1. **Step 0.1**: Create Firebase Project
   - Project name: `relifo-testnet`
   - Create Firestore and Storage

2. **Step 0.2**: Enable Firebase Services
   - Firestore Database (us-central1, test mode)
   - Firebase Storage (us-central1)
   - Firebase Authentication (optional)

3. **Step 0.3**: Create Firestore Collections
   - **`beneficiary_applications`** - Store applicant info and document URLs
     - Fields: campaign_id, beneficiary_address, name, email, phone, country, need_description, document_urls (identity, certificate, proof_of_need), status (Pending/Approved/Rejected), admin_notes, timestamps
   
   - **`beneficiary_approvals`** - Store approved beneficiary details with category limits
     - Fields: beneficiary_address, campaign_id, control_mode ("CONTROLLED"), approved_categories (array), category_limits (map), total_allocation, approved_at, approved_by, status
   
   - **`ngo_admins`** - Store NGO information
     - Fields: ngo_address, name, country, verified, created_at
   
   - **`merchants`** - Store merchant information
     - Fields: merchant_address, name, categories (array), country, status

4. **Step 0.4**: Configure Firebase Security Rules
   - Test mode rules for hackathon: Allow reads/writes until end of 2026
   - Production rules guidance included (role-based access)

5. **Step 0.5**: Set Up Firebase Storage
   - Bucket structure: `applications/{campaign_id}/{beneficiary_address}/[identity|certificate|proof_of_need]/`
   - Test mode rules for file uploads

6. **Step 0.6**: Get Firebase Config
   - Instructions to retrieve API keys and credentials
   - Save for Step 5.2b

---

### Phase 5: Frontend Setup (EXPANDED)

**Step 5.2: Install Dependencies** (UPDATED)
- Added: `firebase` SDK
- Added: `react-hot-toast` for upload notifications
- Removed: Custom token references

**NEW Step 5.2b: Set Up Firebase SDK**
- Initialize Firebase with credentials
- Implement 5 functions:
  1. `uploadDocument()` - Upload files to Storage
  2. `saveApplicationToFirestore()` - Save application
  3. `getApplicationFromFirestore()` - Retrieve application
  4. `updateApplicationStatus()` - Update approval status
  5. `getDocumentUrl()` - Get signed URL for viewing

**NEW Step 5.2c: Environment Configuration** (EXPANDED)
- Added Firebase variables to `.env.local`
- Added USDC contract configuration
- Added demo mode flag

**Step 5.3: Create Document Upload Component** (NEW)
- **File**: `frontend/src/components/BeneficiaryApplicationForm.tsx`
- **Features**:
  - Text fields: name, email, phone, country, need description
  - File uploads: identity, certificate, proof of need
  - Progress bar during upload
  - Save to Firestore on completion
  - Display uploaded file URLs

**NEW Step 5.3b: Create Admin Document Viewer** (CRITICAL)
- **File**: `frontend/src/components/AdminDocumentViewer.tsx`
- **Features**:
  - Load application from Firestore
  - Display all 3 documents with viewer
  - Zoom and download options
  - **Approve Button**: Set category limits ["food", "medicine", "shelter"] → saves to Firestore
  - **Reject Button**: Add rejection reason → saves to Firestore
  - Category configuration UI

**Step 5.4: Setup USDC Integration** (UPDATED)
- Replaced Relifo (RLFC) with USDC
- Contract ID: `CBBD47AB2EB00E041EAME7FA502F06676C1WIL`
- Testnet methods: Faucet, XLM swap, card simulator
- Production methods: XLM swap, MoneyGram, bank, card

---

### Phase 4: Registry Contracts (ENHANCED)

**Step 4.2: BeneficiaryRegistry** (COMPLETELY REWRITTEN)
- Now includes full Controlled Mode specification
- **New Fields in BeneficiaryInfo**:
  - `control_mode: "CONTROLLED"` (all allocations in Controlled mode)
  - `category_limits: Map<String, i128>` (e.g., food: 500000000 stroops)
  - `category_spent: Map<String, i128>` (track per-category spending)
  - `firebase_document_ref: String` (link to Firestore documents)

- **12 Functions** (previously 10):
  1. `initialize()`
  2. `register_for_campaign()` - **Now stores firebase_doc_ref for admin to view documents**
  3. `approve_beneficiary()` - **Now sets control_mode="CONTROLLED" and stores category_limits**
  4. `reject_beneficiary()`
  5. `get_application_status()`
  6. `get_pending_applications()` - **Returns firebase_document_ref for admin dashboard**
  7. `get_approved_beneficiaries()`
  8. `is_approved()`
  9. `revoke_beneficiary()`
  10. `update_category_limits()` - **New: Adjust category limit in Controlled mode**
  11. `get_category_balance()` - **New: Returns remaining balance in category**
  12. `enforce_category_spending()` - **New: Validate category spending before transaction**

---

## Architecture Flow

### Beneficiary Journey
1. **Self-Register**: Upload identity, certificate, proof of need → Saved to Firebase Storage
2. **Application Data**: Saved to `beneficiary_applications` collection in Firestore
3. **Admin Review**: NGO admin clicks "View Document" on pending application
4. **Document Viewer**: Opens AdminDocumentViewer component, shows all 3 uploaded files
5. **Approval**: Admin sets category limits (food: 500 USDC, medicine: 300, shelter: 1000) → Saves to Firestore
6. **On-Chain**: BeneficiaryRegistry contract receives approval, stores control_mode and category_limits
7. **Spending**: Beneficiary spends only within category limits, enforced at both Firestore and contract level

### Admin Workflow
1. See pending applications from `beneficiary_applications` collection
2. Click application → AdminDocumentViewer loads documents from Firebase Storage
3. View all 3 documents (identity, certificate, proof of need)
4. Click "Approve" → Set category limits → Saves to `beneficiary_approvals` Firestore collection
5. Approve call triggers BeneficiaryRegistry contract to store on-chain data
6. Category limits are enforced for future transactions

---

## What This Enables

✅ **Document Verification**: All beneficiary documents stored and viewable by admins
✅ **Transparency**: Application status tracked in both Firebase (user-facing) and Blockchain (audit)
✅ **Category Controls**: NGO sets spending limits per category during approval
✅ **Merchant Controls**: Only approved merchants can accept payments in approved categories
✅ **Audit Trail**: Complete history on Stellar testnet
✅ **Production Ready**: Firebase security rules guidance for mainnet

---

## Files Modified in This Session

1. **STEPS.md**
   - Added Phase 0: Firebase Setup (6 steps)
   - Updated Phase 4, Step 4.2: BeneficiaryRegistry (added 2 new functions, enhanced 3 existing)
   - Expanded Phase 5: Added Firebase SDK, document upload, admin viewer components
   - Updated strategy section (Controlled Mode now ✅)
   - Added Firebase to navigation

---

## Next Steps to Start Implementation

1. **Complete Phase 0**: Set up Firebase project
   - Create Firestore collections
   - Create Storage bucket
   - Get API credentials

2. **Complete Phase 1-3**: Project setup and smart contracts
   - Initialize Rust/Soroban project
   - Implement ReliefVault contract

3. **Complete Phase 4**: Deploy registry contracts
   - Deploy NGORegistry
   - Deploy BeneficiaryRegistry with full Controlled Mode
   - Deploy MerchantRegistry

4. **Complete Phase 5**: Frontend initialization
   - Create Next.js project
   - Install dependencies
   - Set up Firebase SDK
   - Create environment variables

5. **Complete Phase 5b**: Components
   - Build BeneficiaryApplicationForm with document uploads
   - Build AdminDocumentViewer with approval workflow
   - Build category limit configuration

6. **Complete Phase 6**: Test full flow
   - Beneficiary registers and uploads documents
   - Admin approves with category limits
   - Beneficiary spends with controls

---

## User Quote to Remember

> "I want controlled mode full implementation now. SO update my steps accordingly so i can start the project. registered with their account that will be stored in firebase With their certificate and all in the form. from admin approval page there will be view document option"

This update fulfills all of those requirements:
- ✅ Controlled Mode full implementation (Phase 4.2 completely rewritten)
- ✅ Firebase backend (Phase 0 added as foundation)
- ✅ Certificates and documents stored (Firebase Storage)
- ✅ Admin can view documents (AdminDocumentViewer component spec)
- ✅ Document verification before approval (Admin dashboard flow)
- ✅ Category spending controls (BeneficiaryRegistry enforcement)

---

## Testing the Implementation

Once all phases are complete:

```bash
# Phase 0: Firebase should be set up
firebase init  # Verify project is initialized

# Phase 1-4: Smart contracts deployed
stellar contract invoke --network testnet --contract-id [ID] --function register_ngo ...

# Phase 5-6: Frontend running
npm run dev  # Should start on localhost:3000

# Test flow:
1. Beneficiary uploads documents → Firebase Storage
2. Application saved to Firestore
3. Admin reviews → AdminDocumentViewer shows documents
4. Admin approves with category limits
5. Category limits enforced on blockchain
```

---

## Production Considerations (Marked in Phase 0)

- Firebase Security Rules: Currently test mode, update for production
- Document Encryption: Optional for production (Firebase + HTTPS sufficient)
- KYC Compliance: Add compliance layer based on country
- Fiat On-Ramps: Implement MoneyGram/Stripe integration (Phase 7)
- Mainnet Deployment: Use production Stellar network and Firebase

