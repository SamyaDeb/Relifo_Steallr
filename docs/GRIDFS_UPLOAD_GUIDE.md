# GridFS File Upload Guide

This guide explains how to upload, download, and manage PDF files using MongoDB GridFS in the Relifo backend.

---

## Overview

GridFS stores files in MongoDB by splitting them into chunks. Perfect for your use case (2-3 PDFs under 1MB).

**Benefits**:
- No external service needed
- Built into MongoDB
- Simple setup
- Transactional support

---

## File Upload Example

### Frontend Upload (using fetch)

```javascript
async function uploadDocument(file, documentType, beneficiaryAddress) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('type', documentType); // 'identity', 'certificate', 'proof_of_need'
  formData.append('beneficiary_address', beneficiaryAddress);
  
  const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result; // { fileId, filename, url }
}
```

### Backend API Route (Express)

```javascript
const express = require('express');
const router = express.Router();
const { upload, uploadToGridFS } = require('../utils/fileUpload');

// Upload endpoint
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { type, beneficiary_address } = req.body;
    
    // Upload to GridFS
    const fileInfo = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      {
        type: type,
        beneficiary_address: beneficiary_address,
        uploadedBy: req.user?.address || 'anonymous'
      }
    );
    
    res.json({
      success: true,
      file: fileInfo
    });
  } catch (error) {
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

module.exports = router;
```

---

## File Download Example

### Download Route

```javascript
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file metadata
    const metadata = await getFileMetadata(fileId);
    
    // Set headers
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${metadata.filename}"`);
    
    // Stream file from GridFS
    const downloadStream = await downloadFromGridFS(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(404).json({
      error: 'File not found',
      message: error.message
    });
  }
});
```

### Frontend Download

```javascript
function viewDocument(fileId) {
  const url = `http://localhost:3001/api/files/${fileId}`;
  window.open(url, '_blank');
}
```

---

## Complete Beneficiary Application Flow

### 1. Beneficiary Submits Application with Documents

```javascript
async function submitApplication(applicationData, files) {
  // Step 1: Upload documents
  const documents = {};
  
  for (const [type, file] of Object.entries(files)) {
    const fileInfo = await uploadDocument(
      file,
      type,
      applicationData.beneficiary_address
    );
    documents[type] = fileInfo;
  }
  
  // Step 2: Create application
  const response = await fetch('http://localhost:3001/api/beneficiary/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...applicationData,
      documents: documents
    })
  });
  
  return response.json();
}

// Usage
const files = {
  identity: identityPDFFile,
  certificate: certificatePDFFile,
  proof_of_need: proofOfNeedPDFFile
};

await submitApplication({
  campaign_id: 'relief-2026-01',
  beneficiary_address: 'GAB...',
  name: 'John Doe',
  email: 'john@example.com',
  // ... other fields
}, files);
```

### 2. Backend Application Creation

```javascript
router.post('/beneficiary/apply', async (req, res) => {
  try {
    const db = await getDatabase();
    
    const application = {
      ...req.body,
      status: 'Pending',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('beneficiary_applications')
      .insertOne(application);
    
    res.json({
      success: true,
      applicationId: result.insertedId,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to submit application',
      message: error.message
    });
  }
});
```

### 3. NGO Admin Reviews Documents

```javascript
// Get application with documents
router.get('/admin/applications/:applicationId', async (req, res) => {
  try {
    const db = await getDatabase();
    const { applicationId } = req.params;
    
    const application = await db.collection('beneficiary_applications')
      .findOne({ _id: new ObjectId(applicationId) });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Documents URLs are already included
    // Frontend can use them to display/download PDFs
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## File Management

### Delete File

```javascript
const { deleteFromGridFS } = require('../utils/fileUpload');

router.delete('/files/:fileId', async (req, res) => {
  try {
    await deleteFromGridFS(req.params.fileId);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### List All Files

```javascript
router.get('/files', async (req, res) => {
  try {
    const bucket = await getGridFSBucket();
    const files = await bucket.find().toArray();
    
    res.json({
      count: files.length,
      files: files.map(f => ({
        id: f._id,
        filename: f.filename,
        size: f.length,
        uploadDate: f.uploadDate,
        metadata: f.metadata
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Security Considerations

### 1. File Type Validation

Already implemented in `fileUpload.js`:
```javascript
fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
}
```

### 2. File Size Limits

```javascript
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB max
}
```

### 3. Access Control

```javascript
// Add authentication middleware
router.get('/files/:fileId', authenticateUser, async (req, res) => {
  // Verify user has permission to access this file
  const metadata = await getFileMetadata(req.params.fileId);
  
  if (metadata.metadata.beneficiary_address !== req.user.address &&
      !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // ... continue with download
});
```

---

## Testing

### Test File Upload

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "document=@/path/to/test.pdf" \
  -F "type=identity" \
  -F "beneficiary_address=GAB..."
```

### Test File Download

```bash
curl http://localhost:3001/api/files/65a1b2c3d4e5f6g7h8i9j0k1 \
  --output downloaded.pdf
```

---

## MongoDB Compass View

You can view uploaded files in MongoDB Compass:

1. Connect to your database
2. Navigate to database `relifo_testnet`
3. Collections:
   - `documents.files` - File metadata
   - `documents.chunks` - File chunks (actual data)

---

## Next Steps

Now that Phase 0 is complete with GridFS setup, you can:

1. Add the upload routes to your Express server
2. Create frontend upload components
3. Implement document verification workflow
4. Add access control and permissions

For the demo with 2-3 PDFs under 1MB, this setup is perfect!
