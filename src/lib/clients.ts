import { Client, RefreshToken } from "../types/client";
import crypto from "crypto";
import { connectDatabase } from "./db";

/**
 * This library supports both MongoDB (production) and an in-memory fallback
 * (tests or when no database URI is provided).
 *
 * When running under NODE_ENV=test or if `MONGODB_URI` is unset, the original
 * in-memory Maps from the earlier implementation are used.  Otherwise the
 * MongoDB driver is used.
 */

const CLIENT_COLLECTION = "clients";
const REFRESH_COLLECTION = "refresh_tokens";

// in-memory storage for tests
const clientsMemory: Map<string, Client> = new Map();
const refreshMemory: Map<string, RefreshToken> = new Map();

function usingMemory(): boolean {
  // Use in-memory storage only if MONGODB_URI is not set
  return !process.env.MONGODB_URI;
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Export a function to clear in-memory storage for testing
export function clearMemoryStorage(): void {
  clientsMemory.clear();
  refreshMemory.clear();
}


async function getClientsCollection() {
  const db = await connectDatabase();
  return db.collection<Client>(CLIENT_COLLECTION);
}

async function getRefreshCollection() {
  const db = await connectDatabase();
  return db.collection<RefreshToken>(REFRESH_COLLECTION);
}

export async function createClient(
  name: string,
  redirectUris: string[],
  allowedScopes: string[] = ["openid", "profile", "email"]
): Promise<Client> {
  const id = `client_${generateRandomString(16)}`;
  const secret = generateRandomString(32);

  const client: Client = {
    id,
    name,
    secret,
    redirectUris,
    allowedScopes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (usingMemory()) {
    clientsMemory.set(id, client);
    return client;
  }

  const col = await getClientsCollection();
  await col.insertOne(client);
  return client;
}

export async function getClient(clientId: string): Promise<Client | null> {
  if (usingMemory()) {
    return clientsMemory.get(clientId) || null;
  }
  const col = await getClientsCollection();
  return await col.findOne({ id: clientId });
}

export async function listClients(): Promise<Client[]> {
  if (usingMemory()) {
    return Array.from(clientsMemory.values());
  }
  const col = await getClientsCollection();
  return await col.find().toArray();
}

export async function verifyClientSecret(clientId: string, secret: string): Promise<boolean> {
  const client = await getClient(clientId);
  return client ? client.secret === secret : false;
}

export async function updateClient(
  clientId: string,
  updates: Partial<Client>
): Promise<Client | null> {
  const current = await getClient(clientId);
  if (!current) return null;

  const updated: Client = {
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (usingMemory()) {
    clientsMemory.set(clientId, updated);
    return updated;
  }

  const col = await getClientsCollection();
  await col.updateOne({ id: clientId }, { $set: updated });
  return updated;
}

export async function deleteClient(clientId: string): Promise<boolean> {
  if (usingMemory()) {
    return clientsMemory.delete(clientId);
  }
  const col = await getClientsCollection();
  const result = await col.deleteOne({ id: clientId });
  return result.deletedCount === 1;
}

export async function createRefreshToken(
  clientId: string,
  userId: string,
  tokenString: string,
  expiresInDays: number = 7
): Promise<RefreshToken> {
  const id = `refresh_${generateRandomString(16)}`;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const refreshToken: RefreshToken = {
    id,
    clientId,
    userId,
    token: tokenString,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  if (usingMemory()) {
    refreshMemory.set(id, refreshToken);
    return refreshToken;
  }

  const col = await getRefreshCollection();
  await col.insertOne(refreshToken);
  return refreshToken;
}

export async function getRefreshToken(tokenString: string): Promise<RefreshToken | null> {
  if (usingMemory()) {
    for (const token of refreshMemory.values()) {
      if (token.token === tokenString && !token.revokedAt) {
        if (new Date(token.expiresAt) > new Date()) {
          return token;
        }
      }
    }
    return null;
  }
  const col = await getRefreshCollection();
  const token = await col.findOne({ token: tokenString, revokedAt: { $exists: false } });
  if (!token) return null;
  if (new Date(token.expiresAt) <= new Date()) return null;
  return token;
}

export async function revokeRefreshToken(tokenString: string): Promise<boolean> {
  if (usingMemory()) {
    for (const [id, token] of refreshMemory.entries()) {
      if (token.token === tokenString) {
        refreshMemory.set(id, { ...token, revokedAt: new Date().toISOString() });
        return true;
      }
    }
    return false;
  }
  const col = await getRefreshCollection();
  const result = await col.updateOne(
    { token: tokenString },
    { $set: { revokedAt: new Date().toISOString() } }
  );
  return result.modifiedCount === 1;
}