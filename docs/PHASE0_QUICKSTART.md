# Phase 0 Quick Start - Firebase Setup (15 minutes)

Complete these steps to set up Firebase before starting smart contract development.

---

## 1. Create Firebase Project (3 min)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `relifo-testnet`
4. ✅ Google Analytics: **Disable** (not needed for demo)
5. Click **Create project** → Wait for creation (30 seconds)

✓ **Checkpoint**: You should see "relifo-testnet" in your Firebase dashboard

---

## 2. Create Firestore Database (2 min)

1. In Firebase console, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select location: **us-central1**
4. Select mode: **Start in test mode** (for hackathon)
5. Click **Enable**

⚠️ **Note**: Test mode allows anyone to read/write until Dec 31, 2026. Update rules before production.

✓ **Checkpoint**: You should see an empty Firestore database

---

## 3. Create Storage Bucket (1 min)

1. Click **Build** → **Storage**
2. Click **Get started**
3. Default location: **us-central1** ✓
4. Select: **Start in test mode** ✓
5. Click **Done**

✓ **Checkpoint**: You should see an empty Storage bucket

---

## 4. Create Collections (3 min)

In Firestore Database tab, click **+ Start collection**

Create these 4 collections (one by one). Click through the collection name, no need to add initial documents:

1. **Collection name**: `beneficiary_applications`
   - Document ID: `(auto-generated)` 
   - Skip adding fields for now

2. **Collection name**: `beneficiary_approvals`
   - Document ID: `(auto-generated)`

3. **Collection name**: `ngo_admins`
   - Document ID: `(auto-generated)`

4. **Collection name**: `merchants`
   - Document ID: `(auto-generated)`

✓ **Checkpoint**: All 4 collections visible in Firestore console

---

## 5. Get Firebase Config (2 min)

1. Click **⚙️ Project Settings** (gear icon, top-left)
2. Under **Your apps**, select **Web** app (if none exists, click **+ Add app**)
3. Select **Config** radio button
4. Copy the entire config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "relifo-testnet.firebaseapp.com",
  projectId: "relifo-testnet",
  storageBucket: "relifo-testnet.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789...:web:abc123..."
};
```

✓ **Checkpoint**: Config copied and saved

---

## 6. Add Environment Variables (2 min)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=relifo-testnet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=relifo-testnet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=relifo-testnet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...:web:abc123...
```

Replace `...` with actual values from step 5.

✓ **Checkpoint**: `.env.local` file created with all Firebase credentials

---

## 7. Verify Setup (2 min)

### Test Firestore
1. Go to Firestore Database
2. Click **+ Start collection** → `test`
3. Click **Auto ID** → Click **Save**
4. Add a field: `name` (string): `"hello"`
5. Click **Save**
6. Document should appear in `test` collection ✓
7. Delete the `test` collection

### Test Storage
1. Go to Storage
2. Click **Upload file**
3. Upload any small file (< 1 MB)
4. File should appear in bucket ✓
5. Delete the test file

✓ **Checkpoint**: Both Firestore and Storage working

---

## Summary

**Phase 0 Complete!** ✅

You now have:
- ✅ Firebase project created (`relifo-testnet`)
- ✅ Firestore database with 4 collections
- ✅ Storage bucket for documents
- ✅ Environment variables configured
- ✅ Test mode active (ready for development)

**Next**: Go to Phase 1 in STEPS.md to set up your Rust/Soroban project.

---

## Troubleshooting

**Q: "Firestore Database button not showing"**
- A: Try refreshing the page or using incognito mode

**Q: "Firebase config not showing"**
- A: Go to Settings → Project settings → Your apps → Select Web → Copy config

**Q: "Can't upload file to Storage"**
- A: Make sure you're in test mode (allows public access)

**Q: "Want to use Firebase Emulator locally?"**
- A: Optional for Phase 1-3. Set up after creating the project:
  ```bash
  npm install -g firebase-tools
  firebase init emulators
  firebase emulators:start
  ```

---

## Next: Phase 1 - Project Setup

Once Phase 0 is complete, move to Phase 1 in STEPS.md:

1. Initialize Rust project
2. Install Soroban SDK
3. Create smart contracts structure
4. Deploy contracts to testnet

**Estimated time**: 30-45 minutes for Phase 1

---

## Firebase Console Links

- **Firestore**: [console.firebase.google.com](https://console.firebase.google.com) → Select `relifo-testnet` → Build → Firestore Database
- **Storage**: [console.firebase.google.com](https://console.firebase.google.com) → Select `relifo-testnet` → Build → Storage
- **Settings**: [console.firebase.google.com](https://console.firebase.google.com) → Select `relifo-testnet` → ⚙️ Project Settings
- **Security Rules**: [console.firebase.google.com](https://console.firebase.google.com) → Select `relifo-testnet` → Firestore Database → Rules tab

---

## Remember

Phase 0 creates the **data infrastructure** that enables:
- 📱 Beneficiaries to upload documents
- 👨‍💼 Admins to review applications with visible documents
- ✅ Full transparency and audit trail
- 🔒 Secure document storage

Everything else (smart contracts, frontend, payments) depends on this foundation!

