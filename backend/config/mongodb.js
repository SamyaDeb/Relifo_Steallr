const { MongoClient, GridFSBucket } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sammodeb28_db_user:mFMd3EbTLX1TQ026@relifo.s9d7xzj.mongodb.net/';
const DB_NAME = 'relifo_testnet';

let client;
let db;
let gridFSBucket;

async function connectToDatabase() {
  if (db) {
    return { db, gridFSBucket };
  }

  try {
    client = new MongoClient(MONGODB_URI);

    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    db = client.db(DB_NAME);
    
    // Initialize GridFS bucket for file storage
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'documents'
    });

    console.log('✅ GridFS bucket initialized');

    return { db, gridFSBucket };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

async function getGridFSBucket() {
  if (!gridFSBucket) {
    await connectToDatabase();
  }
  return gridFSBucket;
}

async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  getGridFSBucket,
  closeConnection
};
