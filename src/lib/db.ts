import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;
  
  // Read environment variables at connection time, not module load time
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/webtools";
  const dbName = process.env.MONGODB_DB || "webtools";
  
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db(dbName);
  return db;
}

export async function getDb(): Promise<Db> {
  if (!db) {
    return await connectDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
