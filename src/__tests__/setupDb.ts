jest.setTimeout(180000);

import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, closeDatabase } from "../lib/db";

let mongod: MongoMemoryServer;

export async function setupTestDb() {
  try {
    console.log("Creating MongoDB Memory Server...");
    
    // Download the binary first (this can take a while)
    const dbName = "testdb";
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: dbName,
      },
    });
    
    const mongoUri = mongod.getUri();
    console.log("MongoDB Memory Server created with URI:", mongoUri);
    
    // Set environment variables for the test
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGODB_DB = dbName;
    
    // Give the server a moment to fully start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Connect to the test database
    console.log("Connecting to test database...");
    await connectDatabase();
    console.log("Test database connected successfully");
  } catch (err) {
    console.error("setupTestDb failed:", err);
    throw err;
  }
}

export async function teardownTestDb() {
  try {
    console.log("Closing database connection...");
    await closeDatabase();
    
    if (mongod) {
      console.log("Stopping MongoDB Memory Server...");
      await mongod.stop();
      console.log("MongoDB Memory Server stopped");
    }
  } catch (err) {
    console.error("teardownTestDb failed:", err);
  }
}

// dummy test to keep jest from complaining about empty suite
test('setupDb helper file (no-op)', () => {});





