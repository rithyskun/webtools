import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/client";

/**
 * Token service for issuing and validating JWTs.
 */

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

/**
 * Issue an access token for a user + client combination.
 */
export function issueAccessToken(
  userId: string,
  clientId: string,
  email?: string,
  name?: string,
  scope?: string
): string {
  const payload: TokenPayload = {
    sub: userId,
    aud: clientId,
    email,
    name,
    scope,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(ACCESS_TOKEN_EXPIRY),
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    issuer: process.env.NEXTAUTH_URL || "http://localhost:3000",
  });
}

/**
 * Issue a refresh token.
 */
export function issueRefreshToken(userId: string, clientId: string): string {
  const payload: TokenPayload = {
    sub: userId,
    aud: clientId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(REFRESH_TOKEN_EXPIRY),
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    issuer: process.env.NEXTAUTH_URL || "http://localhost:3000",
  });
}

/**
 * Verify and decode an access token.
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.NEXTAUTH_URL || "http://localhost:3000",
    }) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.NEXTAUTH_URL || "http://localhost:3000",
    }) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Convert expiry string (e.g., "1h", "7d") to seconds.
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // default 1 hour

  const [, num, unit] = match;
  const amount = parseInt(num, 10);

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 24 * 60 * 60;
    default:
      return 3600;
  }
}
