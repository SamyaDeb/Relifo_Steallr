# Firebase Schema & Configuration Reference

Quick reference for setting up Firebase Firestore and Storage for Relifo.

---

## Firestore Collections

### 1. `beneficiary_applications`
**Purpose**: Store beneficiary applications with document references
**Document ID**: `{campaign_id}_{beneficiary_address}`

```json
{
  "campaign_id": "string (required)",
  "beneficiary_address": "string (required, Stellar address)",
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "country": "string (required)",
  "need_description": "string (required, 100-500 chars)",
  "document_urls": {
    "identity": "string (URL to Firebase Storage file)",
    "certificate": "string (URL to Firebase Storage file)",
    "proof_of_need": "string (URL to Firebase Storage file)"
  },
  "status": "string (Pending|Approved|Rejected)",
  "admin_notes": "string (optional, for rejection reason or approval notes)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Indexes**:
- `campaign_id` + `status` (for admin dashboard queries)
- `status` (for showing pending applications)

**Example Query**: Get all pending applications for a campaign
```javascript
const query = db.collection('beneficiary_applications')
  .where('campaign_id', '==', campaignId)
  .where('status', '==', 'Pending');
```

---

### 2. `beneficiary_approvals`
**Purpose**: Store approved beneficiary data with category limits
**Document ID**: `{beneficiary_address}`

```json
{
  "beneficiary_address": "string (required, Stellar address)",
  "campaign_id": "string (required)",
  "control_mode": "string (CONTROLLED - all beneficiaries use this)",
  "approved_categories": [
    "food",
    "medicine",
    "shelter"
  ],
  "category_limits": {
    "food": 50000000,
    "medicine": 30000000,
    "shelter": 100000000
  },
  "category_spent": {
    "food": 0,
    "medicine": 0,
    "shelter": 0
  },
  "total_allocation": 180000000,
  "approved_at": "timestamp",
  "approved_by": "string (NGO admin address)",
  "status": "string (Active|Suspended)",
  "contract_hash": "string (optional, hash of on-chain approval for verification)"
}
```

**Notes**:
- Amounts in stroops (1 USDC = 10,000,000 stroops)
- Updated whenever beneficiary spends
- Dual sync: Update Firestore + call blockchain function

**Example Query**: Get category limits for beneficiary
```javascript
const doc = await db.collection('beneficiary_approvals')
  .doc(beneficiaryAddress)
  .get();
```

---

### 3. `ngo_admins`
**Purpose**: Store NGO information and admin users
**Document ID**: `{ngo_address}`

```json
{
  "ngo_address": "string (required, Stellar address)",
  "name": "string (required)",
  "country": "string (required)",
  "registration_number": "string (optional)",
  "verified": "boolean",
  "created_at": "timestamp",
  "verified_at": "timestamp (optional)",
  "contact_email": "string (optional)",
  "status": "string (Active|Suspended|Revoked)"
}
```

**Indexes**:
- `verified` (for filtering verified NGOs)
- `country` (for regional filtering)

---

### 4. `merchants`
**Purpose**: Store merchant information for Controlled Mode
**Document ID**: `{merchant_address}`

```json
{
  "merchant_address": "string (required, Stellar address)",
  "name": "string (required)",
  "country": "string (required)",
  "categories": [
    "food",
    "medicine",
    "shelter"
  ],
  "status": "string (Approved|Suspended|Revoked)",
  "created_at": "timestamp",
  "approved_by": "string (admin address)",
  "total_received": 0
}
```

**Indexes**:
- `status` (for showing active merchants)
- `categories` (array contains query)

**Example Query**: Get all food merchants
```javascript
const query = db.collection('merchants')
  .where('categories', 'array-contains', 'food')
  .where('status', '==', 'Approved');
```

---

## Firebase Storage Structure

**Bucket Name**: `relifo-testnet.appspot.com` (auto-generated)

**Folder Structure**:
```
applications/
├── {campaign_id}/
│   └── {beneficiary_address}/
│       ├── identity/
│       │   └── {filename}  (e.g., passport.pdf)
│       ├── certificate/
│       │   └── {filename}  (e.g., relief_certificate.pdf)
│       └── proof_of_need/
│           └── {filename}  (e.g., disaster_photo.jpg)
```

**Path Format**: 
```
applications/{campaignId}/{beneficiaryAddress}/identity/[file]
applications/{campaignId}/{beneficiaryAddress}/certificate/[file]
applications/{campaignId}/{beneficiaryAddress}/proof_of_need/[file]
```

**File Constraints**:
- Max size: 10 MB per file
- Allowed formats: PDF, JPG, PNG
- Total per beneficiary: 30 MB

---

## Firebase Security Rules

### Development (Test Mode - Hackathon)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test mode until end of 2026
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 12, 31);
    }
  }
}
```

### Production (Role-Based Access)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Beneficiaries can read their own documents
    match /beneficiary_applications/{doc} {
      allow read: if request.auth.uid == resource.data.beneficiary_address;
      allow create: if request.auth != null;
    }
    
    // Only admins can read approvals
    match /beneficiary_approvals/{doc} {
      allow read, write: if request.auth.customClaims.role == 'admin';
    }
    
    // NGOs can see their own admin record
    match /ngo_admins/{doc} {
      allow read: if request.auth.uid == doc;
      allow write: if request.auth.customClaims.role == 'superadmin';
    }
  }
}
```

### Storage Rules (Development)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /applications/{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2026, 12, 31);
    }
  }
}
```

### Storage Rules (Production - Upload Only for Beneficiaries)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /applications/{campaignId}/{beneficiaryId}/{folder}/{file} {
      allow read: if request.auth.uid == beneficiaryId || request.auth.customClaims.role == 'admin';
      allow create: if request.auth.uid == beneficiaryId && 
                       request.resource.size <= 10 * 1024 * 1024;  // 10 MB max
      allow delete: if request.auth.customClaims.role == 'admin';
    }
  }
}
```

---

## Environment Variables for Firebase

Add to `frontend/.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=relifo-testnet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=relifo-testnet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=relifo-testnet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...:web:abc...

# Firebase Emulator (Optional, for local development)
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost:9099
```

---

## Firebase SDK Initialization

**File**: `frontend/src/services/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Use emulator in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
  connectFirestoreEmulator(db, 'localhost', 9099);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

---

## Key Functions for Frontend

### Upload Document
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadDocument(
  file: File,
  campaignId: string,
  beneficiaryId: string,
  docType: 'identity' | 'certificate' | 'proof_of_need'
): Promise<string> {
  const path = `applications/${campaignId}/${beneficiaryId}/${docType}/${file.name}`;
  const fileRef = ref(storage, path);
  
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  
  return url;
}
```

### Save Application
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function saveApplication(data: {
  campaignId: string;
  beneficiaryAddress: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  needDescription: string;
  documentUrls: Record<string, string>;
}): Promise<string> {
  const docRef = await collection(db, 'beneficiary_applications').add({
    ...data,
    status: 'Pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  
  return docRef.id;
}
```

### Get Pending Applications (for Admin)
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function getPendingApplications(campaignId: string) {
  const q = query(
    collection(db, 'beneficiary_applications'),
    where('campaign_id', '==', campaignId),
    where('status', '==', 'Pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
```

### Approve Application
```typescript
export async function approveApplication(
  campaignId: string,
  beneficiaryAddress: string,
  categories: string[],
  categoryLimits: Record<string, number>
): Promise<void> {
  // Update application status to Approved
  await db.collection('beneficiary_applications')
    .doc(`${campaignId}_${beneficiaryAddress}`)
    .update({
      status: 'Approved',
      updated_at: serverTimestamp(),
    });
  
  // Create approval record
  await db.collection('beneficiary_approvals')
    .doc(beneficiaryAddress)
    .set({
      beneficiary_address: beneficiaryAddress,
      campaign_id: campaignId,
      control_mode: 'CONTROLLED',
      approved_categories: categories,
      category_limits: categoryLimits,
      category_spent: Object.fromEntries(categories.map(cat => [cat, 0])),
      total_allocation: Object.values(categoryLimits).reduce((a, b) => a + b, 0),
      approved_at: serverTimestamp(),
      status: 'Active',
    });
}
```

---

## Testing Checklist

- [ ] Firebase project created in console
- [ ] Firestore database created (test mode, us-central1)
- [ ] Storage bucket created
- [ ] Security rules deployed
- [ ] All 4 collections created manually (for reference)
- [ ] Environment variables added to `.env.local`
- [ ] Firebase SDK initializes without errors
- [ ] Can upload test document from Firebase console
- [ ] Can read test document from Storage

---

## Production Deployment

1. **Update Security Rules**: Replace test mode rules with role-based rules
2. **Enable Authentication**: Set up Firebase Auth for admin users
3. **Enable Backup**: Enable Firestore backup in settings
4. **Upgrade Plan**: Move from Spark (free) to Blaze (pay-as-you-go)
5. **Regional Settings**: Change region to match target users
6. **Monitoring**: Enable Cloud Monitoring and set up alerts
7. **GDPR Compliance**: Review data retention and user deletion policies

