import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAccessToken } from "./tokenService";

/**
 * Retrieve the JWT payload attached to the incoming request (if any).
 *
 * @param req Next.js request object
 * @returns token payload or null
 */
export async function getServerAuthToken(req: NextRequest) {
  return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

/**
 * Helper middleware for API routes that require an authenticated user.
 *
 * If the request is not authenticated the function short‑circuits by
 * returning a 401 NextResponse.  Otherwise the decoded token object is
 * returned so caller can inspect properties such as `sub`/`email`.
 */
export async function requireAuth(req: NextRequest) {
  const token = await getServerAuthToken(req);
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return token;
}

/**
 * Validate an API access token from the Authorization header.
 *
 * Extracts the Bearer token from the request, verifies its signature and claims,
 * and optionally checks that it's valid for the specified client.
 *
 * @param req Next.js request
 * @param expectedClientId (optional) verify token's aud matches this client
 * @returns decoded token payload or null if invalid
 */
export function validateAccessToken(req: NextRequest, expectedClientId?: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return null;
  }

  // optionally verify client match
  if (expectedClientId && decoded.aud !== expectedClientId) {
    return null;
  }

  return decoded;
}

/**
 * Middleware for API routes that require a valid API access token.
 *
 * Returns 401 if token is missing or invalid, otherwise returns the decoded token payload.
 */
export function requireAccessToken(req: NextRequest, expectedClientId?: string) {
  const payload = validateAccessToken(req, expectedClientId);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - invalid or missing access token" },
      { status: 401 }
    );
  }
  return payload;
}
