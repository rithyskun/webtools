import { Client, RefreshToken } from "../types/client";
import crypto from "crypto";

/**
 * In-memory clients and refresh tokens storage.
 * In production, use a real database (PostgreSQL, MongoDB, etc).
 */

const clients: Map<string, Client> = new Map();
const refreshTokens: Map<string, RefreshToken> = new Map();

/**
 * Generate a random string for client ID or secret.
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Create a new OAuth client.
 */
export function createClient(
  name: string,
  redirectUris: string[],
  allowedScopes: string[] = ["openid", "profile", "email"]
): Client {
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

  clients.set(id, client);
  return client;
}

/**
 * Get a client by ID.
 */
export function getClient(clientId: string): Client | undefined {
  return clients.get(clientId);
}

/**
 * List all clients.
 */
export function listClients(): Client[] {
  return Array.from(clients.values());
}

/**
 * Verify client credentials (ID and secret).
 */
export function verifyClientSecret(clientId: string, secret: string): boolean {
  const client = clients.get(clientId);
  return client ? client.secret === secret : false;
}

/**
 * Update a client.
 */
export function updateClient(clientId: string, updates: Partial<Client>): Client | undefined {
  const client = clients.get(clientId);
  if (!client) return undefined;

  const updated: Client = {
    ...client,
    ...updates,
    id: client.id, // don't allow ID changes
    createdAt: client.createdAt, // don't allow creation date changes
    updatedAt: new Date().toISOString(),
  };

  clients.set(clientId, updated);
  return updated;
}

/**
 * Delete a client.
 */
export function deleteClient(clientId: string): boolean {
  return clients.delete(clientId);
}

/**
 * Create a refresh token.
 */
export function createRefreshToken(
  clientId: string,
  userId: string,
  tokenString: string,
  expiresInDays: number = 7
): RefreshToken {
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

  refreshTokens.set(id, refreshToken);
  return refreshToken;
}

/**
 * Get a refresh token by its string value.
 */
export function getRefreshToken(tokenString: string): RefreshToken | undefined {
  for (const token of refreshTokens.values()) {
    if (token.token === tokenString && !token.revokedAt) {
      // check expiration
      if (new Date(token.expiresAt) > new Date()) {
        return token;
      }
    }
  }
  return undefined;
}

/**
 * Revoke a refresh token.
 */
export function revokeRefreshToken(tokenString: string): boolean {
  for (const [id, token] of refreshTokens.entries()) {
    if (token.token === tokenString) {
      refreshTokens.set(id, {
        ...token,
        revokedAt: new Date().toISOString(),
      });
      return true;
    }
  }
  return false;
}
