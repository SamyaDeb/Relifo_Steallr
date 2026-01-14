const multer = require('multer');
const { Readable } = require('stream');
const { ObjectId } = require('mongodb');
const { getGridFSBucket } = require('../config/mongodb');

// Configure multer for memory storage (files stored in memory before GridFS)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * Upload a file to GridFS
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} filename - Original filename
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - File info with fileId
 */
async function uploadToGridFS(fileBuffer, filename, metadata = {}) {
  try {
    const bucket = await getGridFSBucket();
    
    // Create a readable stream from the buffer
    const readableStream = Readable.from(fileBuffer);
    
    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadDate: new Date(),
        contentType: 'application/pdf'
      }
    });
    
    // Pipe the buffer to GridFS
    readableStream.pipe(uploadStream);
    
    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: filename,
          url: `/api/files/${uploadStream.id}`
        });
      });
      
      uploadStream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    throw new Error(`GridFS upload failed: ${error.message}`);
  }
}

/**
 * Download a file from GridFS
 * @param {String} fileId - GridFS file ID
 * @returns {Promise<Stream>} - File download stream
 */
async function downloadFromGridFS(fileId) {
  try {
    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);
    
    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      throw new Error('File not found');
    }
    
    // Return download stream
    return bucket.openDownloadStream(objectId);
  } catch (error) {
    throw new Error(`GridFS download failed: ${error.message}`);
  }
}

/**
 * Delete a file from GridFS
 * @param {String} fileId - GridFS file ID
 * @returns {Promise<void>}
 */
async function deleteFromGridFS(fileId) {
  try {
    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);
    
    await bucket.delete(objectId);
  } catch (error) {
    throw new Error(`GridFS delete failed: ${error.message}`);
  }
}

/**
 * Get file metadata from GridFS
 * @param {String} fileId - GridFS file ID
 * @returns {Promise<Object>} - File metadata
 */
async function getFileMetadata(fileId) {
  try {
    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);
    
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      throw new Error('File not found');
    }
    
    return files[0];
  } catch (error) {
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
}

module.exports = {
  upload,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileMetadata
};
