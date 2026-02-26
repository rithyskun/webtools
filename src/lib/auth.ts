import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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
