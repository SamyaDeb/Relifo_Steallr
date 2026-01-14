# Relifo Implementation Steps

> Step-by-step guide to build the Emergency & Disaster Relief Stablecoin System with Claude

---

## 🎯 Hackathon Implementation Strategy

### What We're Building
**Emergency relief system** where donors fund campaigns with USDC, beneficiaries self-register with documents, NGOs approve with document verification, and funds are distributed transparently on Stellar blockchain with **full Controlled Mode implementation**.

### Demo Approach (Testnet)
✅ **Use Stellar Testnet** - Free, fast, production-ready contracts  
✅ **Stellar USDC Testnet** - Donors add USDC from Freighter wallet directly  
✅ **MongoDB Backend** - Store beneficiary applications, documents, certificates  
✅ **Full Controlled Mode** - Document verification required, category spending controls enforced  
✅ **Donor Dashboard** - Connect Freighter wallet, check USDC balance, transfer USDC to campaign vault  
✅ **Admin Dashboard** - View and approve/reject applications with document verification  
📱 **Production Flow** - Same flow with mainnet USDC from Freighter  

### What to Skip for Hackathon
❌ Real MoneyGram API integration (mainnet only, needs credentials)  
❌ Advanced KYC/compliance (testnet demo with MongoDB is enough)  
❌ Production-grade document encryption (GridFS security is sufficient)  
❌ RLFC token creation (using Stellar's native USDC instead)  

### What Judges Will See
1. **Problem**: Traditional relief is slow (7-14 days), opaque (30% leakage)
2. **Live Demo**: Donor connects Freighter → Adds USDC → Donates to campaign → Beneficiary applies with documents → NGO verifies → approves → allocates funds → beneficiary spends with controls
3. **Transparency**: Public audit trail on Stellar testnet, document verification on MongoDB/GridFS
4. **Scalability**: Full Controlled Mode with category limits and merchant approval

---

## Quick Navigation

- [Phase 0: MongoDB Setup](#phase-0-mongodb-setup)
- [Phase 1: Project Setup](#phase-1-project-setup)
- [Phase 2: Smart Contracts Foundation](#phase-2-smart-contracts-foundation)
- [Phase 3: ReliefVault Contract](#phase-3-reliefvault-contract)
- [Phase 4: Registry Contracts](#phase-4-registry-contracts)
- [Phase 5: Frontend Setup](#phase-5-frontend-setup)
- [Phase 6: Frontend Components](#phase-6-frontend-components)
- [Phase 7: Testing & Deployment](#phase-7-testing--deployment)
- [Verification Checklist](#verification-checklist)

---

## Phase 0: MongoDB Setup

### Step 0.1: Create MongoDB Atlas Account (Recommended) or Install Local MongoDB
**Goal**: Set up MongoDB for beneficiary applications and document storage

**Option A: MongoDB Atlas (Cloud - Recommended for Demo)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a new cluster (M0 Free tier is sufficient for demo)
4. Cluster name: `relifo-testnet`
5. Choose region: Closest to you (e.g., AWS us-east-1)
6. Wait for cluster creation (2-3 minutes)

**Option B: Local MongoDB**
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify installation
mongo --version
```

**Verification**:
- [ ] MongoDB Atlas cluster created OR local MongoDB running
- [ ] Can access MongoDB (Atlas dashboard or `mongosh` locally)

---

### Step 0.2: Create Database and Get Connection String
**Goal**: Set up database and obtain connection credentials

**For MongoDB Atlas**:
1. Click "Connect" on your cluster (Cluster name: `Relifo`)
2. Add your current IP address to IP whitelist (or allow all: `0.0.0.0/0` for demo)
3. Create database user:
   - Username: `relifo_admin`
   - Password: Generate strong password (save it!)
4. Select "Connect your application"
5. Copy connection string (Node.js driver)

**Connection string format**:
```
mongodb+srv://relifo_admin:<password>@relifo.s9d7xzj.mongodb.net/?retryWrites=true&w=majority
```

**For Local MongoDB**:
```
mongodb://localhost:27017/relifo
```

**Verification**:
- [ ] Connection string copied
- [ ] Database user created (Atlas) or localhost accessible
- [ ] Password saved securely

---

### Step 0.3: Create Database and Collections
**Goal**: Set up database schema for beneficiary management

**Database**: `relifo_testnet`

**Collections to create** (MongoDB will auto-create on first insert, but here's the schema):

1. **`beneficiary_applications`**
   - Fields:
     - `campaign_id` (string, indexed)
     - `beneficiary_address` (string, indexed)
     - `name` (string)
     - `email` (string)
     - `phone` (string)
     - `country` (string)
     - `need_description` (string)
     - `documents` (object) - `{ identity: {fileId, filename, url}, certificate: {}, proof_of_need: {} }`
     - `status` (string, indexed) - Pending/Approved/Rejected
     - `created_at` (Date)
     - `updated_at` (Date)
     - `admin_notes` (string)

2. **`beneficiary_approvals`**
   - Fields:
     - `beneficiary_address` (string, unique index)
     - `campaign_id` (string)
     - `control_mode` (string) - "CONTROLLED"
     - `approved_categories` (array) - ["food", "medicine", "shelter"]
     - `category_limits` (object) - `{ food: 500, medicine: 300, shelter: 1000 }`
     - `category_spent` (object) - `{ food: 0, medicine: 0, shelter: 0 }`
     - `total_allocation` (number)
     - `approved_at` (Date)
     - `approved_by` (string)
     - `status` (string) - Active/Suspended

3. **`ngo_admins`**
   - Fields:
     - `ngo_address` (string, unique index)
     - `name` (string)
     - `country` (string)
     - `verified` (boolean, indexed)
     - `created_at` (Date)

4. **`merchants`**
   - Fields:
     - `merchant_address` (string, unique index)
     - `name` (string)
     - `categories` (array, indexed) - ["food", "medicine", "shelter"]
     - `country` (string)
     - `status` (string, indexed) - Approved/Suspended

**Verification**:
- [ ] Database `relifo_testnet` created
- [ ] Can connect via `mongosh` or Compass
- [ ] Ready to create collections

---

### Step 0.4: Create Indexes (Optional for Demo, Required for Production)
**Goal**: Optimize query performance

**Using mongosh or MongoDB Compass**:
```javascript
// Connect to database
use relifo_testnet

// Create indexes
db.beneficiary_applications.createIndex({ campaign_id: 1, status: 1 })
db.beneficiary_applications.createIndex({ beneficiary_address: 1 })
db.beneficiary_approvals.createIndex({ beneficiary_address: 1 }, { unique: true })
db.ngo_admins.createIndex({ ngo_address: 1 }, { unique: true })
db.merchants.createIndex({ merchant_address: 1 }, { unique: true })
db.merchants.createIndex({ categories: 1 })
```

**Verification**:
- [ ] Indexes created
- [ ] Can view indexes in Atlas or Compass

---

### Step 0.5: Set Up File Storage for Documents
**Goal**: Configure storage for document uploads (identity, certificate, proof of need)

**Option A: GridFS (MongoDB's Built-in File Storage)**
- Built into MongoDB, no external service needed
- Stores files as chunks in MongoDB
- Good for files < 16MB
- Use with `multer-gridfs-storage` npm package

**Option B: Cloudinary (Recommended - Free Tier Available)**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get API credentials from dashboard
3. Free tier: 25 GB storage, 25 GB bandwidth
4. Automatic image optimization and CDN

**Option C: AWS S3 (Production)**
- Create S3 bucket
- Set up IAM user with S3 access
- More complex but scalable

**For Demo: We'll use Cloudinary (easiest)**

**Verification**:
- [ ] Cloudinary account created
- [ ] API Key, API Secret, Cloud Name obtained
- [ ] Ready to upload test file

---

### Step 0.6: Get Environment Credentials
**Goal**: Collect all credentials for frontend `.env.local`

**MongoDB Connection**:
- Connection string (from Step 0.2)

**Cloudinary** (if using):
- Cloud Name
- API Key
- API Secret

**Save these for Step 5.2**

**Verification**:
- [ ] MongoDB connection string saved
- [ ] Cloudinary credentials saved (if using)
- [ ] All credentials ready for `.env.local`

---

## Phase 1: Project Setup

### Step 1.1: Create Soroban Contract Project
**Goal**: Initialize a new Rust/Soroban project for smart contracts

**Action**:
```bash
cd /Users/samya/Desktop/Relifo
cargo new --lib contracts
cd contracts
```

**Verification**:
- [ ] Folder `contracts/` exists
- [ ] File `contracts/Cargo.toml` exists
- [ ] File `contracts/src/lib.rs` exists

**Command to continue**:
```
I've created the contract project. What's next?
```

---

### Step 1.2: Add Soroban Dependencies
**Goal**: Configure Cargo.toml with Soroban SDK

**File to create/update**: `contracts/Cargo.toml`

**Action**: 
I will replace the auto-generated Cargo.toml with Soroban-specific configuration.

**Tell me when ready** and I'll:
1. Set up Soroban dependencies
2. Configure build targets
3. Add test dependencies

**Verification**:
- [ ] `soroban-sdk` is in `[dependencies]`
- [ ] `soroban-contract` is in `[dependencies]`
- [ ] `[lib]` section has `crate-type = ["cdylib"]`

---

### Step 1.3: Create Rust Module Structure
**Goal**: Organize contract code into logical modules

**Files to create**:
- `contracts/src/error.rs` - Error types
- `contracts/src/event.rs` - Event definitions
- `contracts/src/token.rs` - USDC token wrapper
- `contracts/src/vault.rs` - ReliefVault contract (Direct + optional Controlled)
- `contracts/src/ngo.rs` - NGO registry
- `contracts/src/beneficiary.rs` - Beneficiary registry (for Controlled mode)
- `contracts/src/merchant.rs` - Merchant registry (optional, for Controlled mode)
- `contracts/src/lib.rs` - Main contract entry point

**Action**: 
I will create all 8 files with basic structure and module declarations.

**Note**: Direct Mode is default - beneficiaries have full autonomy. Controlled Mode (beneficiary registry + merchant registry) is optional for high-oversight scenarios.

**Tell me when ready** and I'll create the file structure.

**Verification**:
- [ ] All 8 files exist in `contracts/src/`
- [ ] `lib.rs` has `mod` declarations for all modules
- [ ] Project compiles: `cargo check`

---

## Phase 2: Smart Contracts Foundation

### Step 2.1: Implement Error Types
**Goal**: Define all error cases for contracts

**File**: `contracts/src/error.rs`

**Errors to include**:
- Unauthorized
- CampaignNotFound
- InsufficientBalance
- BeneficiaryNotWhitelisted
- CategoryLimitExceeded
- MerchantNotApproved
- InvalidAmount
- AuthorizationNotFound
- AlreadyInitialized
- NGONotRegistered
- NGONotVerified
- InvalidControlMode

**Action**: 
I will implement the complete error enum with `#[contracterror]` macro.

**Verification**:
- [ ] File compiles: `cargo check -p relifo-contracts`
- [ ] All 12 errors are defined
- [ ] Errors have display messages

---

### Step 2.2: Implement Event Types
**Goal**: Define all event types for on-chain audit trail

**File**: `contracts/src/event.rs`

**Events to include**:
- NGORegistered
- NGOVerified
- CampaignCreated
- DonationReceived
- BeneficiaryWhitelisted
- BeneficiaryRevoked
- FundsAllocated
- DirectTransfer
- SpendingAuthorized
- TransactionExecuted
- MerchantRegistered
- AuditTrail

**Action**: 
I will implement event structures with all necessary fields.

**Verification**:
- [ ] File compiles
- [ ] All 12 event types defined
- [ ] Each event has timestamp field

---

### Step 2.3: Implement Token Wrapper
**Goal**: Create USDC token interface for contract interactions

**File**: `contracts/src/token.rs`

**Functions to implement**:
- `transfer(from, to, amount) -> Result`
- `balance_of(account) -> i128`
- `approve(spender, amount) -> Result`

**Action**: 
I will create wrapper functions that call the USDC contract.

**Verification**:
- [ ] File compiles
- [ ] 3 functions defined
- [ ] Functions use proper Soroban SDK types

---

## Phase 3: ReliefVault Contract

### Step 3.1: Define Vault Data Structures
**Goal**: Create core data types for vault contract

**File**: `contracts/src/vault.rs`

**Structures to define**:
- `Campaign` - Campaign metadata
- `SpendingAuthorization` - Spending authorization record
- `CampaignBalance` - Track campaign funds

**Action**: 
I will implement all structures with proper Soroban types and serialization.

**Verification**:
- [ ] File compiles
- [ ] All 3 structures defined
- [ ] Structures derive Clone, Serialize

---

### Step 3.2: Implement Vault Initialization
**Goal**: Create contract initialization function

**Function**: `fn initialize(env, usdc_contract, admin) -> Result`

**Logic**:
1. Store USDC contract reference
2. Store admin address
3. Initialize empty campaign map
4. Initialize empty balance maps
5. Emit initialization event

**Action**: 
I will implement the full initialization function.

**Verification**:
- [ ] Function is public and #[contractimpl]
- [ ] Stores all 4 required items in contract storage
- [ ] Returns Result type
- [ ] Compiles without errors

---

### Step 3.3: Implement Campaign Creation
**Goal**: Allow NGO to create relief campaigns (self-service)

**Function**: `fn create_campaign(env, campaign_id, description, goal_amount, control_mode) -> Result<String>`

**Logic**:
1. Verify caller is registered and verified NGO
2. Create Campaign struct with control mode (Direct/Controlled)
3. Store in campaigns map
4. Initialize campaign balance
5. Emit CampaignCreated event
6. Return campaign_id

**Action**: 
I will implement the complete function.

**Verification**:
- [ ] Only verified NGOs can create campaigns
- [ ] Campaign includes control_mode field
- [ ] Campaign stored in persistent storage
- [ ] Event emitted with correct data
- [ ] Function returns campaign_id

---

### Step 3.4: Implement Donation Function
**Goal**: Allow donors to contribute USDC to campaigns

**Function**: `fn donate(env, campaign_id, amount) -> Result`

**Logic**:
1. Validate campaign exists and is active
2. Validate amount > 0
3. Transfer USDC from donor to vault
4. Update campaign balance
5. Track donor (optional: store donation history)
6. Emit DonationReceived event

**Action**: 
I will implement the complete function with USDC transfer.

**Verification**:
- [ ] Accepts valid donations
- [ ] Rejects invalid amounts (≤ 0)
- [ ] Rejects non-existent campaigns
- [ ] Updates balance correctly
- [ ] Event includes all transaction details

---

### Step 3.5: Implement Fund Allocation
**Goal**: Allow NGO to allocate funds to beneficiaries with optional controls

**Function**: `fn allocate_to_beneficiary(env, campaign_id, beneficiary, amount, control_mode, categories, limits) -> Result`

**Logic**:
1. Verify caller is NGO for campaign
2. Get campaign control mode (Direct/Controlled)
3. If Controlled mode: Verify beneficiary is whitelisted
4. Check campaign has sufficient funds
5. Create allocation record with control mode
6. If Controlled: Set category spending limits
7. Emit FundsAllocated event

**Action**: 
I will implement the complete function with dual-mode support.

**Verification**:
- [ ] Only NGO can allocate
- [ ] Supports both Direct and Controlled modes
- [ ] Checks campaign balance
- [ ] Stores allocation per beneficiary with mode
- [ ] Stores category limits only for Controlled mode
- [ ] Event includes control mode and limits

---

### Step 3.6: Implement Spending Authorization
**Goal**: Authorize beneficiary to spend with merchant in category

**Function**: `fn authorize_spending(env, beneficiary, merchant, amount, category) -> Result<u64>`

**Logic**:
1. Verify beneficiary is whitelisted and active
2. Verify merchant is registered
3. Verify merchant approved for category
4. Check beneficiary allocation ≥ amount
5. Check category limit not exceeded
6. Create authorization record with unique ID
7. Emit SpendingAuthorized event
8. Return authorization ID

**Action**: 
I will implement the complete function with all validations.

**Verification**:
- [ ] Returns unique authorization ID
- [ ] Validates all conditions
- [ ] Enforces category limits
- [ ] Event includes auth_id for tracking
- [ ] Authorization stored with Pending status

---

### Step 3.7: Implement Spending Execution
**Goal**: Execute authorized spending and transfer USDC to merchant

**Function**: `fn execute_spending(env, auth_id) -> Result`

**Logic**:
1. Retrieve authorization by ID
2. Verify authorization status is Pending
3. Verify not already executed
4. Transfer USDC to merchant
5. Update beneficiary allocation
6. Update category spending tracker
7. Mark authorization as Executed
8. Emit TransactionExecuted event

**Action**: 
I will implement the complete function.

**Verification**:
- [ ] Only executes pending authorizations
- [ ] Prevents double-spending
- [ ] Transfers USDC to correct merchant
- [ ] Updates all tracking maps
- [ ] Emits event with correct details

---

### Step 3.8: Implement Query Functions
**Goal**: Create read-only functions for data queries

**Functions to implement**:
- `fn get_campaign_balance(campaign_id) -> i128`
- `fn get_beneficiary_balance(beneficiary) -> i128`
- `fn get_category_spent(beneficiary, category) -> i128`
- `fn get_authorization_status(auth_id) -> u32`

**Action**: 
I will implement all 4 query functions.

**Verification**:
- [ ] All 4 functions implemented
- [ ] Return correct data types
- [ ] Handle missing data gracefully
- [ ] No side effects (view-only)

---

## Phase 4: Registry Contracts

### Step 4.1: Implement NGORegistry
**Goal**: Create contract for NGO self-registration and verification

**File**: `contracts/src/ngo.rs`

**Structure**: `NGOInfo`
- address
- name
- registration_number
- country
- status (Pending/Verified/Suspended/Revoked)
- registered_at
- verified_at
- total_campaigns_created

**Functions to implement**:
1. `initialize(env, admin) -> Result` - Initialize registry
2. `register_ngo(env, name, registration_number, country, documents) -> Result` - Self-register
3. `verify_ngo(env, ngo_address) -> Result` - Admin verifies NGO
4. `revoke_ngo(env, ngo_address) -> Result` - Revoke NGO
5. `is_verified(env, ngo_address) -> bool` - Check if verified
6. `get_ngo_info(env, ngo_address) -> NGOInfo` - Get full info

**Action**: 
I will implement the complete contract with all functions.

**Verification**:
- [ ] Anyone can register (self-registration)
- [ ] Only admin can verify
- [ ] Only admin can revoke
- [ ] Registration creates event
- [ ] Query functions work correctly
- [ ] Contract compiles and stores data

---

### Step 4.2: Implement BeneficiaryRegistry with Controlled Mode
**Goal**: Create contract for beneficiary registration, approval, and whitelisting with full Controlled Mode

**File**: `contracts/src/beneficiary.rs`

**Structure**: `BeneficiaryInfo`
- `address` (Stellar wallet address)
- `campaign_id` (which campaign they registered for)
- `control_mode` (string: "CONTROLLED" for all - single mode)
- `status` (Pending/Approved/Rejected/Suspended)
- `registered_at` (timestamp)
- `approved_at` (timestamp, optional)
- `approved_categories` (array) - ["food", "medicine", "shelter"] for Controlled mode
- `category_limits` (Map<String, i128>) - e.g., {food: 500000000, medicine: 300000000, shelter: 1000000000}
- `total_allocation` (i128) - Amount allocated in stroops
- `spent` (i128) - Total spent
- `category_spent` (Map<String, i128>) - Track spending per category
- `mongodb_document_ref` (string) - Reference to MongoDB document ID
- `mongodb_app_status` (string) - Link to MongoDB application status

**Full Controlled Mode Enforcement**:
- All allocations are in CONTROLLED mode
- Every transaction must be pre-authorized
- Category limits are enforced at both contract and MongoDB level
- Only whitelisted merchants can accept payments
- Real-time category balance tracking

**Functions to implement**:
1. `initialize(env, admin) -> Result` - Initialize registry
2. `register_for_campaign(env, beneficiary, campaign_id, mongodb_doc_id) -> Result` - Beneficiary self-registration
   - Input: campaign_id, mongodb_document_id (e.g., ObjectId from MongoDB)
   - Creates record linked to MongoDB application
   - Sets status to Pending
   - Event includes mongodb_doc_id for admin to retrieve documents

3. `approve_beneficiary(env, campaign_id, beneficiary, categories, limits) -> Result` - NGO approves beneficiary
   - Input: categories array ["food", "medicine", "shelter"], limits map {food: 500000000}
   - Sets status to Approved
   - Stores control_mode as "CONTROLLED"
   - Creates category_spent map initialized to {food: 0, medicine: 0, shelter: 0}
   - Returns total_allocation (sum of all category limits)

4. `reject_beneficiary(env, campaign_id, beneficiary, reason) -> Result` - NGO rejects beneficiary
   - Sets status to Rejected
   - Stores reason in event

5. `get_application_status(env, campaign_id, beneficiary) -> BeneficiaryInfo` - Check application status

6. `get_pending_applications(env, campaign_id) -> Vec<BeneficiaryInfo>` - Get all pending applications for NGO review
   - Returns list with mongodb_document_ref for admin dashboard

7. `get_approved_beneficiaries(env, campaign_id) -> Vec<Address>` - Get list of approved beneficiaries

8. `is_approved(env, campaign_id, beneficiary) -> bool` - Check if beneficiary is approved and in CONTROLLED mode

9. `revoke_beneficiary(env, beneficiary) -> Result` - Revoke approval

10. `update_category_limits(env, beneficiary, category, new_limit) -> Result` - Adjust limit (Controlled mode)
    - Only NGO can call
    - Updates limit and recalculates total_allocation

11. `get_category_balance(env, beneficiary, category) -> i128` - Get remaining balance in category
    - Returns: category_limit - category_spent

12. `enforce_category_spending(env, beneficiary, category, amount) -> Result` - Check before transaction
    - Validates: category_spent + amount <= category_limit
    - Used by frontend before calling execute_spending

**Action**: 
I will implement the complete contract with all functions and full Controlled Mode support.

**Verification**:
- [ ] Beneficiaries can self-register with MongoDB document references
- [ ] Only campaign NGO can approve/reject
- [ ] All approvals set control_mode to "CONTROLLED"
- [ ] Category limits are stored and tracked
- [ ] Category spending is enforced
- [ ] Registration creates BeneficiaryRegistered event
- [ ] Approval creates BeneficiaryApproved event with categories and limits
- [ ] Rejection creates BeneficiaryRejected event
- [ ] Query functions work correctly and return Controlled Mode data
- [ ] Contract compiles and stores data
- [ ] MongoDB document reference is stored on-chain for audit trail

---

### Step 4.3: Implement MerchantRegistry (Controlled Mode Only)
**Goal**: Create contract for merchant registration and category management

**File**: `contracts/src/merchant.rs`

**Structure**: `MerchantInfo`
- address
- name
- approved_categories
- status (Approved/Suspended/Revoked)
- registered_at
- total_received

**Functions to implement**:
1. `initialize(env, admin) -> Result` - Initialize registry
2. `register_merchant(env, merchant, name, categories) -> Result` - Register merchant
3. `approve_for_category(env, merchant, category) -> Result` - Add category
4. `is_approved_for_category(env, merchant, category) -> bool` - Check approval
5. `revoke_merchant(env, merchant) -> Result` - Revoke merchant
6. `get_merchant_info(env, merchant) -> MerchantInfo` - Get full info

**Action**: 
I will implement the complete contract with all functions.

**Verification**:
- [ ] Only admin can register
- [ ] Only admin can revoke
- [ ] Category approval works
- [ ] Query functions work correctly
- [ ] Contract compiles and stores data

---

### Step 4.4: Update Main lib.rs
**Goal**: Integrate all contracts into main entry point

**File**: `contracts/src/lib.rs`

**Action**: 
I will add:
1. Module declarations for all contracts (vault, ngo, beneficiary, merchant)
2. Export all contract implementations
3. Add proper attribute macros

**Verification**:
- [ ] All modules declared
- [ ] Exports are correct
- [ ] Project compiles: `cargo build --release --target wasm32-unknown-unknown`
- [ ] WASM output generated

---

## Phase 5: Frontend Setup

### Step 5.1: Create Next.js Project
**Goal**: Initialize React/Next.js frontend application

**Action**:
```bash
cd /Users/samya/Desktop/Relifo
npx create-next-app@latest frontend --typescript --tailwind --eslint
```

**Verification**:
- [ ] Folder `frontend/` created
- [ ] Files: `package.json`, `next.config.js`, `tsconfig.json`
- [ ] Folders: `src/`, `public/`, `node_modules/`

---

### Step 5.2: Install Dependencies
**Goal**: Add Stellar/Soroban, wallet, and MongoDB packages

**Action**:
```bash
cd frontend
npm install @stellar/stellar-sdk @stellar/freighter-api axios swr react-toastify zustand
npm install mongodb              # MongoDB driver for Node.js
npm install cloudinary          # For document uploads (or use GridFS)
npm install multer              # For handling file uploads
npm install react-hot-toast     # For upload notifications
npm install -D @types/node
```

**Note**: 
- MongoDB driver for database operations
- Cloudinary for easy document storage (or use GridFS/S3)
- react-hot-toast is optional but recommended for upload feedback
- MoneyGram SDK (`@moneygram/digital-api`) is for production only

**Verification**:
- [ ] Dependencies in `package.json`
- [ ] `node_modules/` updated
- [ ] MongoDB driver version ≥ 6.0.0
- [ ] Can run: `npm run dev`

---

### Step 5.2b: Set Up MongoDB Connection
**Goal**: Initialize MongoDB connection in backend/API routes

**File**: `frontend/src/lib/mongodb.ts` (or `pages/api/lib/mongodb.ts`)

**Action**:
Create MongoDB connection file:
```typescript
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('relifo_testnet');
}
```

**API Route Functions to implement** (in `pages/api/` folder):
- `uploadDocument(file, campaignId, beneficiaryId, docType)` - Upload to Cloudinary/GridFS
- `saveApplication(data)` - Save beneficiary application to MongoDB
- `getApplication(campaignId, beneficiaryId)` - Retrieve application
- `updateApplicationStatus(campaignId, beneficiaryId, status)` - Update approval status
- `getPendingApplications(campaignId)` - Get all pending for review

**Verification**:
- [ ] File created: `frontend/src/lib/mongodb.ts`
- [ ] Connection helper functions implemented
- [ ] Proper TypeScript types
- [ ] Handles errors gracefully
- [ ] Tests basic connectivity

---

### Step 5.2c: Environment Configuration
**Goal**: Set up environment variables with MongoDB credentials

**File**: `frontend/.env.local`

**Variables to add**:
```env
# Stellar Testnet Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Contract IDs (will be filled after deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ID=
NEXT_PUBLIC_NGO_CONTRACT_ID=
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=

# MongoDB Configuration (from MongoDB Atlas - Cluster: Relifo)
MONGODB_URI=mongodb+srv://sammodeb28_db_user:mFMd3EbTLX1TQ026@relifo.s9d7xzj.mongodb.net/
MONGODB_DB=relifo_testnet

# Cloudinary Configuration (for document uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stellar USDC Configuration (Native Stellar Asset)
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
# Note: This is Circle's USDC issuer on Stellar testnet
# For mainnet, use: USDC/GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN

# Freighter Wallet
NEXT_PUBLIC_ENABLE_FREIGHTER=true

# Demo Parameters
NEXT_PUBLIC_DEMO_MODE=true
```

**Action**: 
I will create .env.local template with all required MongoDB variables.

**Verification**:
- [ ] File created: `frontend/.env.local`
- [ ] All MongoDB variables present (get from Atlas)
- [ ] All contract IDs placeholders added
- [ ] File is in `.gitignore`
- [ ] `.env.local.example` created for documentation

---

### Step 5.3: Create Document Upload Component
**Goal**: Build beneficiary application form with document uploads

**File**: `frontend/src/components/BeneficiaryApplicationForm.tsx`

**Features**:
- Name, email, phone, country, description fields
- File upload for: identity document, certificate, proof of need
- Progress bar for uploads
- Preview uploaded files
- Save to MongoDB via API route
- Show document URLs in confirmation

**Component Structure**:
```typescript
export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  needDescription: string;
  documents: {
    identity: File | null;
    certificate: File | null;
    proofOfNeed: File | null;
  };
}

interface BeneficiaryApplicationFormProps {
  campaignId: string;
  onComplete: (applicationId: string) => void;
}
```

**Functions to implement**:
- `handleDocumentUpload(file, type)` - Upload to Cloudinary via API
- `saveToDatabase(data)` - POST to `/api/applications` to save in MongoDB
- `validateForm()` - Check all fields and documents present
- `getUploadProgress()` - Show upload percentage
- `displayDocumentUrls()` - Show uploaded files after completion

**API Route**: `pages/api/applications.ts`
```typescript
// POST /api/applications - Save application to MongoDB
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const db = await getDatabase();
    const result = await db.collection('beneficiary_applications').insertOne({
      ...req.body,
      status: 'Pending',
      created_at: new Date(),
      updated_at: new Date()
    });
    res.status(201).json({ id: result.insertedId });
  }
}
```

**Verification**:
- [ ] Component created
- [ ] Form validation works
- [ ] Files upload to Cloudinary
- [ ] Application data saved to MongoDB
- [ ] Can view uploaded documents
- [ ] Proper error handling and feedback

---

### Step 5.4: Create Admin Document Viewer
**Goal**: Build admin dashboard component to view uploaded documents

**File**: `frontend/src/components/AdminDocumentViewer.tsx`

**Features**:
- Display application details (name, email, phone, country, need description)
- Show uploaded document thumbnails
- Full-screen document viewer with zoom
- Download document option
- Approve/Reject buttons
- Add approval notes/category limits

**Component Structure**:
```typescript
interface ApplicationDetail {
  id: string;
  beneficiaryName: string;
  email: string;
  phone: string;
  country: string;
  needDescription: string;
  documents: {
    identity: string;    // Cloudinary URL
    certificate: string; // Cloudinary URL
    proofOfNeed: string; // Cloudinary URL
  };
  status: "Pending" | "Approved" | "Rejected";
}

interface AdminDocumentViewerProps {
  applicationId: string;
  campaignId: string;
  onApprove: (categories: string[], limits: Record<string, number>) => void;
  onReject: (reason: string) => void;
}
```

**Functions to implement**:
- `loadApplicationDetails(campaignId, applicationId)` - Fetch from MongoDB via API
- `viewDocument(documentUrl)` - Open document viewer (Cloudinary URL)
- `downloadDocument(documentUrl)` - Download to admin's computer
- `approveApplication(categories, limits)` - PUT to `/api/applications/[id]` to update MongoDB
- `rejectApplication(reason)` - Update status and save reason
- `getCategoryConfig()` - Get available categories ["food", "medicine", "shelter"]

**API Routes**:
```typescript
// GET /api/applications/[id] - Get application details
// PUT /api/applications/[id] - Update application (approve/reject)
```

**Verification**:
- [ ] Component created
- [ ] All documents display correctly
- [ ] Approve button saves to MongoDB
- [ ] Category limits stored properly
- [ ] Reject button saves reason
- [ ] Proper error handling

---

### Step 5.3: Create Environment Configuration
**Goal**: Set up environment variables for testnet demo

**File**: `frontend/.env.local`

**Variables to add**:
```env
# Stellar Testnet Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Contract IDs (will be filled after deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ID=
NEXT_PUBLIC_NGO_CONTRACT_ID=
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=
NEXT_PUBLIC_MERCHANT_CONTRACT_ID= # optional for Controlled Mode

# Stellar USDC Configuration (Native Stellar Asset)
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

# Freighter Wallet
NEXT_PUBLIC_ENABLE_FREIGHTER=true

# Demo Parameters
NEXT_PUBLIC_DEMO_MODE=true
```

**Action**: 
I will create the .env.local file with template values.

**Verification**:
- [ ] File created: `frontend/.env.local`
- [ ] All required variables present
- [ ] File is in `.gitignore`
- [ ] `.env.local.example` created for documentation

---

### Step 5.4: Setup USDC Integration with Freighter Wallet
**Goal**: Configure Stellar USDC for testnet demo with Freighter wallet connection

**USDC on Stellar Testnet:**
- **Asset Code**: USDC
- **Issuer**: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` (Circle testnet)
- **Network**: Stellar Testnet
- **Decimals**: 7 (standard Stellar asset)

**Donor Wallet Flow (Testnet):**
1. **Connect Freighter Wallet** - User clicks "Connect Wallet" button
2. **Check USDC Balance** - Frontend queries USDC balance from Freighter
3. **Add USDC Button** - If balance is low, show "Add USDC" option:
   - For testnet: Link to Stellar testnet USDC faucet or friendbot
   - For mainnet: User already has USDC in their Freighter wallet
4. **Donate** - Transfer USDC directly from Freighter wallet to campaign vault

**Freighter Wallet Integration:**
```typescript
// Install: npm install @stellar/freighter-api
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

// 1. Check if Freighter is installed
const freighterInstalled = await isConnected();

// 2. Get user's public key (wallet address)
const publicKey = await getPublicKey();

// 3. Get USDC balance
const usdcAsset = new Asset('USDC', USDC_ISSUER);
const account = await server.loadAccount(publicKey);
const usdcBalance = account.balances.find(b => 
  b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER
)?.balance || '0';

// 4. Transfer USDC to campaign vault
const transaction = new TransactionBuilder(account)
  .addOperation(Operation.payment({
    destination: VAULT_ADDRESS,
    asset: usdcAsset,
    amount: donationAmount.toString()
  }))
  .build();

const signedXDR = await signTransaction(transaction.toXDR(), 'TESTNET');
```

**Production Flow (Mainnet):**
- Same Freighter wallet integration
- Users already have USDC in their Freighter wallet from:
  - Buying USDC on exchanges (Coinbase, Binance)
  - Receiving USDC payments
  - Converting XLM to USDC via Stellar DEX
  - MoneyGram cash pickup → USDC (future integration)

**No RLFC Token Needed:**
- We use Stellar's native USDC directly
- No token minting or wrapping required
- No custom asset creation
- Direct USDC transfers from donor → vault → beneficiary → merchant

**Action**:
- Testnet: Use Circle's testnet faucet endpoint
- Production: Configure MoneyGram SDK integration (Phase 7)

**Verification**:
- [ ] USDC contract ID added to .env.local
- [ ] Testnet faucet accessible
- [ ] Can create trustline in frontend
- [ ] Can receive test USDC
- `callFunction(contractId, method, args)` - Call contract function
- `submitTransaction(tx)` - Submit signed transaction
- `queryContractData(contractId, key)` - Read contract storage
- `getTransactionStatus(hash)` - Check tx status

**Action**: 
I will implement complete Soroban service.

**Verification**:
- [ ] File created
- [ ] 5 functions implemented
- [ ] Uses Soroban RPC properly
- [ ] Error handling in place

---

### Step 5.6: Create Hooks - useWallet
**Goal**: Create React hook for wallet management

**File**: `frontend/src/hooks/useWallet.ts`

**Functionality**:
- Manage wallet connection state
- Store public key in local state
- Detect wallet disconnection
- Handle wallet switching

**Action**: 
I will implement the custom hook with proper state management.

**Verification**:
- [ ] Hook created
- [ ] Returns { publicKey, connect, disconnect, isConnected }
- [ ] Handles component lifecycle
- [ ] Works with Freighter

---

### Step 5.7: Create Hooks - useContract
**Goal**: Create React hook for contract interactions

**File**: `frontend/src/hooks/useContract.ts`

**Functionality**:
- Call contract functions
- Track loading/error states
- Handle transaction submission
- Manage authorization

**Action**: 
I will implement the hook with proper error handling.

**Verification**:
- [ ] Hook created
- [ ] Returns { call, loading, error, data }
- [ ] Handles async operations
- [ ] Integrates with wallet hook

---

### Step 5.8: Create Layout Components
**Goal**: Build reusable layout components

**Files**:
- `frontend/src/components/Layout.tsx` - Main layout wrapper
- `frontend/src/components/Navbar.tsx` - Top navigation bar
- `frontend/src/components/Sidebar.tsx` - Role-based sidebar
- `frontend/src/components/Footer.tsx` - Footer

**Action**: 
I will implement all 4 layout components with Tailwind CSS.

**Verification**:
- [ ] All 4 files created
- [ ] Components use Tailwind classes
- [ ] Responsive design
- [ ] Role-based navigation links

---

## Phase 6: Frontend Components

### Step 6.1: Create Auth Components
**Goal**: Implement wallet connection and authentication UI

**Files**:
- `frontend/src/components/WalletConnect.tsx` - Connect button
- `frontend/src/components/RoleGuard.tsx` - Role-based access wrapper

**Action**: 
I will implement both components with proper state management.

**Verification**:
- [ ] WalletConnect shows address when connected
- [ ] RoleGuard protects pages by role
- [ ] Proper error messages
- [ ] Mobile responsive

---

### Step 6.2: Create Donor Wallet Component with Freighter Integration
**Goal**: Build donor wallet interface for connecting Freighter and managing USDC

**Files**:
- `frontend/src/components/donor/DonorWallet.tsx` - Main wallet component
- `frontend/src/components/donor/AddUSDC.tsx` - Add USDC instructions/faucet link
- `frontend/src/services/freighter.ts` - Freighter wallet integration
- `frontend/src/hooks/useWallet.ts` - Wallet state management hook

**Features to implement**:
1. **Wallet Connection**
   - "Connect Freighter Wallet" button
   - Check if Freighter extension is installed
   - Request wallet connection permission
   - Display connected wallet address (short format: G7X8...9KL2)
   - "Disconnect" button

2. **USDC Balance Display**
   - Query USDC balance from connected Freighter wallet
   - Display balance: "100.00 USDC" with refresh button
   - Real-time updates after transactions
   - Show loading state while fetching

3. **Add USDC Button**
   - Shows when balance is 0 or low
   - For testnet: Links to Stellar USDC testnet faucet
   - For mainnet: Shows instructions to buy USDC
   - Modal with step-by-step guide:
     * Testnet: "Get free USDC from testnet faucet"
     * Mainnet: "Buy USDC from exchanges or use Stellar DEX"

4. **Wallet State Management**
   ```typescript
   interface WalletState {
     isConnected: boolean;
     publicKey: string | null;
     usdcBalance: string;
     isFreighterInstalled: boolean;
     network: 'testnet' | 'mainnet';
   }
   ```

**Freighter Integration Service (`services/freighter.ts`):**
```typescript
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { Server, Asset } from 'stellar-sdk';

export async function connectFreighterWallet() {
  const connected = await isConnected();
  if (!connected) {
    throw new Error('Freighter wallet not installed');
  }
  const publicKey = await getPublicKey();
  return publicKey;
}

export async function getUSDCBalance(publicKey: string) {
  const server = new Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(publicKey);
  const usdcBalance = account.balances.find(
    b => b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER
  );
  return usdcBalance?.balance || '0';
}

export async function transferUSDC(
  fromPublicKey: string,
  toAddress: string,
  amount: string
) {
  const server = new Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(fromPublicKey);
  
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.payment({
      destination: toAddress,
      asset: new Asset('USDC', USDC_ISSUER),
      amount: amount
    }))
    .setTimeout(30)
    .build();
  
  const signedXDR = await signTransaction(transaction.toXDR(), 'TESTNET');
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
  const result = await server.submitTransaction(signedTx);
  return result;
}
```

**Action**: 
I will implement donor wallet component with Freighter integration.

**Verification**:
- [ ] DonorWallet component created
- [ ] Freighter connection works
- [ ] Displays wallet address when connected
- [ ] Shows USDC balance from Freighter
- [ ] "Add USDC" button with testnet faucet link
- [ ] Real-time balance updates
- [ ] Error handling for Freighter not installed
- [ ] Disconnect functionality works

---

### Step 6.3: Create Donor Components
**Goal**: Build donor donation interface

**Files**:
- `frontend/src/components/donor/CampaignList.tsx` - Browse campaigns
- `frontend/src/components/donor/DonationForm.tsx` - Submit donation
- `frontend/src/components/donor/DonationHistory.tsx` - View donations

**Action**: 
I will implement all 3 components with form validation and transaction handling.

**Verification**:
- [ ] All 3 components created
- [ ] Campaign list fetches from blockchain
- [ ] Shows control mode (Direct/Controlled)
- [ ] Donation form validates input
- [ ] History displays past donations
- [ ] USDC approval handling

---

### Step 6.4: Create Admin Components
**Goal**: Build admin control panel

**Files**:
- `frontend/src/components/admin/NGOVerification.tsx` - Verify NGO registrations
- `frontend/src/components/admin/MerchantRegistry.tsx` - Register merchants
- `frontend/src/components/admin/SystemStats.tsx` - Platform metrics
- `frontend/src/components/admin/SettingsPanel.tsx` - Admin settings

**Action**: 
I will implement admin dashboard components.

**Verification**:
- [ ] All 4 components created
- [ ] NGO verification workflow
- [ ] Merchant registration form
- [ ] Real-time stats display
- [ ] Settings management

---

### Step 6.5: Create NGO Components
**Goal**: Build NGO manager interface with beneficiary application review

**Files**:
- `frontend/src/components/ngo/NGORegistration.tsx` - Self-registration form
- `frontend/src/components/ngo/CampaignCreator.tsx` - Create campaigns
- `frontend/src/components/ngo/ControlModeSelector.tsx` - Choose Direct/Controlled
- `frontend/src/components/ngo/ApplicationReview.tsx` - Review beneficiary applications
- `frontend/src/components/ngo/ApplicationList.tsx` - View pending/approved/rejected applications
- `frontend/src/components/ngo/DocumentViewer.tsx` - View uploaded documents
- `frontend/src/components/ngo/BeneficiaryApproval.tsx` - Approve/reject beneficiaries
- `frontend/src/components/ngo/AllocationManager.tsx` - Allocate funds to approved beneficiaries
- `frontend/src/components/ngo/CategoryConfig.tsx` - Set spending categories (Controlled mode during approval)

**Action**: 
I will implement all 9 NGO components with beneficiary application workflow.

**Verification**:
- [ ] All 9 components created
- [ ] Self-registration workflow works
- [ ] Campaign creation with control mode selection
- [ ] ApplicationList shows pending/approved/rejected applications
- [ ] ApplicationReview displays full application details
- [ ] DocumentViewer shows uploaded documents (IPFS or storage)
- [ ] BeneficiaryApproval has approve/reject buttons with reasons
- [ ] Category limits can be set during approval (Controlled mode)
- [ ] AllocationManager only shows approved beneficiaries
- [ ] Fund allocation form works for both modes

---

### Step 6.6: Create Beneficiary Components
**Goal**: Build beneficiary self-registration and wallet interface

**Files**:
- `frontend/src/components/beneficiary/CampaignBrowser.tsx` - Browse active campaigns
- `frontend/src/components/beneficiary/ApplicationForm.tsx` - Register for campaign
- `frontend/src/components/beneficiary/DocumentUpload.tsx` - Upload documents
- `frontend/src/components/beneficiary/ApplicationStatus.tsx` - Track application status
- `frontend/src/components/beneficiary/WalletDashboard.tsx` - View balance & mode
- `frontend/src/components/beneficiary/DirectSpending.tsx` - Direct spending UI (default)
- `frontend/src/components/beneficiary/MoneyGramCashout.tsx` - Cash out USDC via MoneyGram
- `frontend/src/components/beneficiary/QRCodeScanner.tsx` - Scan merchant QR codes
- `frontend/src/components/beneficiary/ControlledSpending.tsx` - Request spending (Controlled mode)
- `frontend/src/components/beneficiary/TransactionHistory.tsx` - View history

**Action**: 
I will implement all 10 beneficiary components with full registration workflow.

**Verification**:
- [ ] All 10 components created
- [ ] CampaignBrowser displays active campaigns with eligibility info
- [ ] ApplicationForm collects all required information
- [ ] DocumentUpload handles file upload (IPFS or backend storage)
- [ ] ApplicationStatus shows real-time status (Pending/Approved/Rejected)
- [ ] WalletDashboard shows balance & mode (visible after approval)
- [ ] DirectSpending is the default flow (prominent UI)
- [ ] MoneyGram cashout integrated
- [ ] QR code scanner for merchants
- [ ] ControlledSpending only shown if mode = Controlled
- [ ] Transaction history with filters

---

### Step 6.7: Create Merchant Components
**Goal**: Build merchant order management (Controlled Mode only)

**Files**:
- `frontend/src/components/merchant/OrderDashboard.tsx` - View orders
- `frontend/src/components/merchant/OrderFulfillment.tsx` - Complete orders
- `frontend/src/components/merchant/PaymentHistory.tsx` - Payment tracking

**Action**: 
I will implement all 3 merchant components.

**Verification**:
- [ ] All 3 components created
- [ ] Order list with status
- [ ] Order fulfillment workflow
- [ ] Payment history display

---

### Step 6.8: Create Audit Explorer
**Goal**: Build public audit trail viewer

**File**: `frontend/src/components/AuditExplorer.tsx`

**Features**:
- Search by campaign, beneficiary, merchant, tx hash
- Filter by date range and action type
- Filter by control mode (Direct/Controlled)
- Display full transaction details including application registrations
- Display beneficiary approval/rejection events
- Export functionality

**Action**: 
I will implement complete audit explorer with zero auth requirement.

**Verification**:
- [ ] Component created
- [ ] Accessible without wallet
- [ ] Search functionality working
- [ ] Displays all event details including BeneficiaryRegistered, BeneficiaryApproved, BeneficiaryRejected
- [ ] Shows document hashes for transparency

---

### Step 6.9: Create Pages
**Goal**: Build main application pages

**Files**:
- `frontend/src/pages/index.tsx` - Landing page
- `frontend/src/pages/campaigns/browse.tsx` - Public campaign browser
- `frontend/src/pages/beneficiary/apply.tsx` - Beneficiary application page
- `frontend/src/pages/beneficiary/status.tsx` - Application status tracker
- `frontend/src/pages/dashboard.tsx` - Role-based dashboard
- `frontend/src/pages/audit.tsx` - Public audit explorer

**Action**: 
I will implement all 6 pages with proper routing.

**Verification**:
- [ ] All 6 pages created
- [ ] Dashboard routes to correct component by role
- [ ] Landing page has call-to-action
- [ ] Audit page accessible without auth

---

## Phase 7: Testing & Deployment

### Step 7.1: Write Contract Unit Tests
**Goal**: Create comprehensive tests for smart contracts

**File**: `contracts/src/lib.rs` - Add tests module

**Tests to write**:
- `test_initialize()` - Contract initialization
- `test_create_campaign()` - Campaign creation
- `test_donate()` - Donation flow
- `test_allocate_funds()` - Fund allocation
- `test_category_limits()` - Category limit enforcement
- `test_unauthorized_access()` - Access control

**Action**: 
I will add all 6 tests to contracts.

**Verification**:
- [ ] Tests compile: `cargo test --lib`
- [ ] All tests pass
- [ ] Coverage includes error cases

---

### Step 7.2: Build and Compile Contracts
**Goal**: Compile contracts to WASM

**Action**:
```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

**Verification**:
- [ ] Command completes without errors
- [ ] WASM files generated in `target/wasm32-unknown-unknown/release/`
- [ ] File sizes reasonable (< 1MB each)

---

### Step 7.3: Deploy to Testnet
**Goal**: Deploy contracts to Stellar testnet

**Prerequisites**:
- Testnet account with lumens
- Soroban CLI installed

**Action**:
I will provide deployment script that:
1. Uploads WASM files
2. Creates contract instances
3. Initializes all contracts
4. Saves contract IDs to .env.local

**Verification**:
- [ ] Contract IDs returned from deployment
- [ ] .env.local updated with IDs
- [ ] Contracts visible on Stellar Explorer

---

### Step 7.4: Test Frontend Connection
**Goal**: Verify frontend connects to deployed contracts

**Action**:
```bash
cd frontend
npm run dev
```

**Manual tests**:
1. Connect Freighter wallet
2. Load donor dashboard
3. Try to donate (or create donation transaction)
4. Check transaction on Stellar Explorer

**Verification**:
- [ ] Frontend loads without errors
- [ ] Wallet connects
- [ ] Dashboard displays data
- [ ] Transactions appear on testnet

---

### Step 7.5: Integration Testing
**Goal**: Test full end-to-end flows

**Test scenarios**:
1. **Donor Flow**: Donate → See donation on blockchain
2. **NGO Flow**: Create campaign → Whitelist beneficiary → Allocate funds
3. **Beneficiary Flow**: Receive allocation → Request spending → See balance update
4. **Merchant Flow**: Register merchant → Receive payment → See history
5. **Audit Flow**: View transaction on public explorer

**Action**: 
Manual testing checklist to verify all flows work.

**Verification**:
- [ ] All 5 flows complete successfully
- [ ] Events emitted on blockchain
- [ ] Balances update correctly
- [ ] No transaction errors

---

### Step 7.6: Security Review Checklist
**Goal**: Review contracts for security issues

**Checks**:
- [ ] No reentrancy vulnerabilities
- [ ] Access control enforced on all sensitive functions
- [ ] Integer overflow/underflow handled
- [ ] No uninitialized state
- [ ] Event logging complete
- [ ] Fund locking/escrow working correctly
- [ ] Category limits enforced at contract level

**Action**: 
I will review contracts and suggest fixes for any issues found.

---

### Step 7.7: Create Deployment Documentation
**Goal**: Document deployment process for future reference

**Files**:
- `DEPLOYMENT.md` - Step-by-step deployment guide
- `CONFIG.md` - Configuration reference
- `TROUBLESHOOTING.md` - Common issues and fixes

**Action**: 
I will create all 3 documentation files.

**Verification**:
- [ ] All 3 files created
- [ ] Include actual commands used
- [ ] Include contract IDs and addresses
- [ ] Include environment setup steps

---

## Verification Checklist

Use this checklist to verify completion of each phase:

### Phase 1: Project Setup
- [ ] `contracts/` folder created
- [ ] `Cargo.toml` configured with Soroban
- [ ] Module files created (7 files)
- [ ] `cargo check` passes

### Phase 2: Contracts Foundation
- [ ] `error.rs` with 9 error types
- [ ] `event.rs` with 9 event types
- [ ] `token.rs` with 3 functions
- [ ] All files compile

### Phase 3: ReliefVault
- [ ] Vault structures defined
- [ ] Initialize function works
- [ ] Create campaign works
- [ ] Donate function works
- [ ] Allocate funds works
- [ ] Authorize spending works
- [ ] Execute spending works
- [ ] 4 query functions work
- [ ] `cargo build --release --target wasm32-unknown-unknown` succeeds

### Phase 4: Registry Contracts
- [ ] BeneficiaryRegistry contract complete
- [ ] MerchantRegistry contract complete
- [ ] All functions implemented
- [ ] Module exports correct
- [ ] All tests pass

### Phase 5: Frontend Setup
- [ ] `frontend/` folder created
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Wallet service implemented
- [ ] Soroban service implemented
- [ ] useWallet hook implemented
- [ ] useContract hook implemented
- [ ] Layout components created

### Phase 6: Frontend Components
- [ ] Auth components created
- [ ] Donor components created
- [ ] Admin components created
- [ ] NGO components created
- [ ] Beneficiary components created
- [ ] Merchant components created
- [ ] Audit explorer created
- [ ] Main pages created
- [ ] `npm run dev` works without errors

### Phase 7: Testing & Deployment
- [ ] Contract unit tests written and passing
- [ ] Contracts compiled to WASM
- [ ] Contracts deployed to testnet
- [ ] Contract IDs obtained
- [ ] Frontend connects to deployed contracts
- [ ] End-to-end flows tested and working
- [ ] Security review completed
- [ ] Documentation created

---

## How to Use This Guide

1. **Read a step completely** before asking me to implement it
2. **Tell me "I'm ready for Step X.X"** to proceed
3. **I will implement** the entire step in one go
4. **You verify** using the checklist
5. **Tell me any issues** and I'll fix them
6. **Move to next step** when complete

---

## Example Workflow

```
You: "I'm ready for Step 1.1"
Me: [Creates Cargo project]
You: "Done, what's next?"
You: "I'm ready for Step 1.2"
Me: [Sets up Cargo.toml with Soroban]
You: "Verified. Ready for Step 1.3"
Me: [Creates 7 module files]
... continue through all phases
```

---

## Need Help?

At any point, you can ask me:
- **"What does this code do?"** - I'll explain
- **"Why isn't this working?"** - I'll debug
- **"Can we skip Step X?"** - I'll explain implications
- **"Let me see the full code for Step X"** - I'll show it

Good luck! 🚀
