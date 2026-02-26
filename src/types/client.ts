/**
 * Client registration types for OAuth token issuance.
 */

export interface Client {
  id: string;
  name: string;
  secret: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdAt: string;
  updatedAt: string;
  ownerId?: string; // optional owner user ID
}

export interface TokenPayload {
  sub: string; // user ID
  aud: string; // client ID
  email?: string;
  name?: string;
  iat: number;
  exp: number;
  scope?: string;
  refreshTokenId?: string; // for refresh tokens
}

export interface RefreshToken {
  id: string;
  clientId: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
}
