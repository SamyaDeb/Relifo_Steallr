# MongoDB Schema & Configuration Reference

Quick reference for setting up MongoDB for Relifo with document storage.

---

## MongoDB Collections

### 1. `beneficiary_applications`
**Purpose**: Store beneficiary applications with document references
**Indexes**: 
- `{ campaign_id: 1, status: 1 }`
- `{ beneficiary_address: 1 }`

```javascript
{
  "_id": ObjectId("..."),
  "campaign_id": "string (required)",
  "beneficiary_address": "string (required, Stellar address)",
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "country": "string (required)",
  "need_description": "string (required, 100-500 chars)",
  "documents": {
    "identity": {
      "fileId": "cloudinary_public_id",
      "filename": "passport.pdf",
      "url": "https://res.cloudinary.com/..."
    },
    "certificate": {
      "fileId": "cloudinary_public_id",
      "filename": "certificate.pdf",
      "url": "https://res.cloudinary.com/..."
    },
    "proof_of_need": {
      "fileId": "cloudinary_public_id",
      "filename": "photo.jpg",
      "url": "https://res.cloudinary.com/..."
    }
  },
  "status": "Pending|Approved|Rejected",
  "admin_notes": "string (optional, for rejection reason or approval notes)",
  "created_at": ISODate("2026-01-14T..."),
  "updated_at": ISODate("2026-01-14T...")
}
```

**Example Query**: Get all pending applications for a campaign
```javascript
db.beneficiary_applications.find({
  campaign_id: "campaign_123",
  status: "Pending"
});
```

---

### 2. `beneficiary_approvals`
**Purpose**: Store approved beneficiary data with category limits
**Indexes**: `{ beneficiary_address: 1 }` (unique)

```javascript
{
  "_id": ObjectId("..."),
  "beneficiary_address": "string (required, Stellar address, unique)",
  "campaign_id": "string (required)",
  "control_mode": "CONTROLLED",
  "approved_categories": ["food", "medicine", "shelter"],
  "category_limits": {
    "food": 500,
    "medicine": 300,
    "shelter": 1000
  },
  "category_spent": {
    "food": 0,
    "medicine": 0,
    "shelter": 0
  },
  "total_allocation": 1800,
  "approved_at": ISODate("2026-01-14T..."),
  "approved_by": "string (NGO admin address)",
  "status": "Active|Suspended",
  "contract_hash": "string (optional, hash of on-chain approval)"
}
```

**Example Query**: Get category limits for beneficiary
```javascript
db.beneficiary_approvals.findOne({
  beneficiary_address: "GABC123..."
});
```

---

### 3. `ngo_admins`
**Purpose**: Store NGO information and admin users
**Indexes**: 
- `{ ngo_address: 1 }` (unique)
- `{ verified: 1 }`

```javascript
{
  "_id": ObjectId("..."),
  "ngo_address": "string (required, Stellar address, unique)",
  "name": "string (required)",
  "country": "string (required)",
  "registration_number": "string (optional)",
  "verified": false,
  "created_at": ISODate("2026-01-14T..."),
  "verified_at": null,
  "contact_email": "string (optional)",
  "status": "Active|Suspended|Revoked"
}
```

---

### 4. `merchants`
**Purpose**: Store merchant information for Controlled Mode
**Indexes**: 
- `{ merchant_address: 1 }` (unique)
- `{ categories: 1 }`

```javascript
{
  "_id": ObjectId("..."),
  "merchant_address": "string (required, Stellar address, unique)",
  "name": "string (required)",
  "country": "string (required)",
  "categories": ["food", "medicine", "shelter"],
  "status": "Approved|Suspended|Revoked",
  "created_at": ISODate("2026-01-14T..."),
  "approved_by": "string (admin address)",
  "total_received": 0
}
```

**Example Query**: Get all food merchants
```javascript
db.merchants.find({
  categories: "food",
  status: "Approved"
});
```

---

## Document Storage Options

### Option A: Cloudinary (Recommended for Demo)
**Why**: Easy setup, free tier, automatic CDN, image optimization

**Setup**:
1. Sign up at [https://cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Free tier: 25 GB storage, 25 GB bandwidth

**Upload Example**:
```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const result = await cloudinary.uploader.upload(file.path, {
  folder: `relifo/${campaignId}/${beneficiaryId}`,
  resource_type: 'auto'
});

// result.secure_url - Use this URL in MongoDB
```

---

### Option B: GridFS (MongoDB's Built-in)
**Why**: No external service needed, stores files directly in MongoDB

**Setup**:
```javascript
import { GridFSBucket } from 'mongodb';

const db = await getDatabase();
const bucket = new GridFSBucket(db, { bucketName: 'documents' });

// Upload
const uploadStream = bucket.openUploadStream(filename, {
  metadata: { 
    campaignId, 
    beneficiaryId, 
    docType: 'identity' 
  }
});
fs.createReadStream(file.path).pipe(uploadStream);

// Download
const downloadStream = bucket.openDownloadStreamByName(filename);
downloadStream.pipe(res);
```

**Limitations**: 16MB per file (MongoDB document limit)

---

### Option C: AWS S3 (Production)
**Why**: Scalable, secure, integrates with CloudFront CDN

**Setup**:
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

await s3.send(new PutObjectCommand({
  Bucket: 'relifo-documents',
  Key: `${campaignId}/${beneficiaryId}/${docType}/${filename}`,
  Body: fileBuffer,
  ContentType: file.mimetype
}));
```

---

## MongoDB Connection Setup

### MongoDB Atlas (Cloud)
```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('relifo_testnet');
}
```

---

## API Routes Examples

### Save Application (POST /api/applications)
```typescript
import { getDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const db = await getDatabase();
    
    const application = {
      ...req.body,
      status: 'Pending',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('beneficiary_applications').insertOne(application);
    
    res.status(201).json({ 
      id: result.insertedId,
      success: true 
    });
  }
}
```

### Get Pending Applications (GET /api/applications/pending)
```typescript
export default async function handler(req, res) {
  const { campaignId } = req.query;
  const db = await getDatabase();
  
  const applications = await db.collection('beneficiary_applications')
    .find({ 
      campaign_id: campaignId,
      status: 'Pending' 
    })
    .toArray();
  
  res.status(200).json(applications);
}
```

### Approve Application (PUT /api/applications/[id])
```typescript
export default async function handler(req, res) {
  const { id } = req.query;
  const { categories, categoryLimits } = req.body;
  
  const db = await getDatabase();
  
  // Update application status
  await db.collection('beneficiary_applications').updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status: 'Approved',
        updated_at: new Date()
      }
    }
  );
  
  // Create approval record
  await db.collection('beneficiary_approvals').insertOne({
    beneficiary_address: req.body.beneficiaryAddress,
    campaign_id: req.body.campaignId,
    control_mode: 'CONTROLLED',
    approved_categories: categories,
    category_limits: categoryLimits,
    category_spent: Object.fromEntries(categories.map(c => [c, 0])),
    total_allocation: Object.values(categoryLimits).reduce((a, b) => a + b, 0),
    approved_at: new Date(),
    approved_by: req.body.adminAddress,
    status: 'Active'
  });
  
  res.status(200).json({ success: true });
}
```

---

## Environment Variables

Add to `frontend/.env.local`:

```env
# MongoDB Configuration (Atlas)
MONGODB_URI=mongodb+srv://relifo_admin:<password>@relifo-testnet.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=relifo_testnet

# Cloudinary Configuration (for document uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Or for GridFS (no extra config needed, uses MongoDB)
# STORAGE_TYPE=gridfs

# Or for S3
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# S3_BUCKET=relifo-documents
```

---

## Testing Checklist

- [ ] MongoDB Atlas cluster created OR local MongoDB running
- [ ] Connection string working
- [ ] Database `relifo_testnet` created
- [ ] Can insert test document
- [ ] Can query documents
- [ ] Indexes created for performance
- [ ] Cloudinary account created (or GridFS/S3 configured)
- [ ] Can upload test file
- [ ] Can retrieve file URL
- [ ] Environment variables in `.env.local`

---

## Production Considerations

1. **Security**:
   - Enable MongoDB authentication
   - Use IP whitelist (not 0.0.0.0/0)
   - Rotate credentials regularly
   - Use read-only replicas for queries

2. **Performance**:
   - Create compound indexes for common queries
   - Use aggregation pipelines for complex queries
   - Enable MongoDB connection pooling
   - Consider caching with Redis

3. **Backup**:
   - Enable automated backups in Atlas
   - Export critical data regularly
   - Test restore procedures

4. **Monitoring**:
   - Enable MongoDB Atlas monitoring
   - Set up alerts for slow queries
   - Monitor storage usage
   - Track API rate limits (Cloudinary/S3)

5. **Compliance**:
   - Encrypt documents at rest
   - Use signed URLs for document access
   - Implement audit logging
   - GDPR: Add document deletion endpoints

---

## Comparison: MongoDB vs Firebase

| Feature | MongoDB | Firebase |
|---------|---------|----------|
| **Setup** | Self-hosted or Atlas | Fully managed |
| **Queries** | Flexible, SQL-like | Limited, NoSQL only |
| **File Storage** | GridFS/External | Built-in Storage |
| **Cost** | Free tier (512MB) | Free tier (1GB) |
| **Control** | Full control | Limited control |
| **Scalability** | Horizontal scaling | Auto-scaling |
| **Real-time** | Change streams | Real-time by default |
| **Best for** | Complex queries | Simple CRUD + Auth |

---

## MongoDB Advantages for Relifo

✅ **More Control**: Full control over data structure and queries  
✅ **Better Queries**: Support for complex aggregations and joins  
✅ **No Vendor Lock-in**: Can migrate to self-hosted MongoDB anytime  
✅ **Established**: Industry-standard database with huge ecosystem  
✅ **Flexible Schema**: Easy to add new fields without migration  
✅ **Cost-Effective**: Free tier sufficient for demo, predictable pricing  

---

## Next Steps

1. Complete Phase 0: MongoDB Setup (15 min)
2. Set up Cloudinary for document storage (5 min)
3. Create API routes for CRUD operations (30 min)
4. Implement document upload (30 min)
5. Build admin document viewer (45 min)

Total: ~2 hours for full MongoDB integration
