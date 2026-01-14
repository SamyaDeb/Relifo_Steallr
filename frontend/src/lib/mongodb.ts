import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend globalThis for development mode connection caching
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection
  // across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'relifo_testnet');
}

// Helper to get specific collection
export async function getCollection<T extends Document>(collectionName: string) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

// Collection names
export const COLLECTIONS = {
  BENEFICIARY_APPLICATIONS: 'beneficiary_applications',
  BENEFICIARY_APPROVALS: 'beneficiary_approvals',
  NGO_ADMINS: 'ngo_admins',
  MERCHANTS: 'merchants',
} as const;
