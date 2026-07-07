import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/datachat';
const client = new MongoClient(uri);

let db: Db;

export const initDb = async () => {
  try {
    await client.connect();
    db = client.db(); // uses the database from the URI
    console.log(`Connected to MongoDB: ${db.databaseName}`);
    
    // Ensure the metadata collection exists
    const collections = await db.listCollections({ name: '_datasets' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('_datasets');
      console.log('Created _datasets metadata collection.');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
};
