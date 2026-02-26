import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken } from "../../../../lib/tokenService";
import {
  getRefreshToken,
  revokeRefreshToken,
  getClient,
  createRefreshToken,
} from "../../../../lib/clients";
import { issueAccessToken, issueRefreshToken } from "../../../../lib/tokenService";

/**
 * POST /api/auth/refresh
 *
 * Exchange a refresh token for a new access token (and optionally new refresh token).
 *
 * Request body:
 * {
 *   "refresh_token": "eyJ...",
 *   "client_id": "client_xxx"
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJ...",
 *   "refresh_token": "eyJ..." (rotated),
 *   "token_type": "Bearer",
 *   "expires_in": 3600
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      refresh_token?: string;
      client_id?: string;
    };
    const { refresh_token, client_id } = body;

    if (!refresh_token || !client_id) {
      return NextResponse.json(
        { success: false, error: "refresh_token and client_id are required" },
        { status: 400 }
      );
    }

    // Verify refresh token format and expiration
    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Verify client_id matches the token's aud claim
    if (decoded.aud !== client_id) {
      return NextResponse.json(
        { success: false, error: "client_id mismatch" },
        { status: 403 }
      );
    }

    // Verify client exists and is still valid
    const client = getClient(client_id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Invalid client_id" },
        { status: 400 }
      );
    }

    // Check refresh token in database (hasn't been revoked, etc.)
    const storedToken = getRefreshToken(refresh_token);
    if (!storedToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token not found or revoked" },
        { status: 401 }
      );
    }

    // Issue new access token
    const newAccessToken = issueAccessToken(
      decoded.sub,
      client_id,
      decoded.email,
      decoded.name,
      decoded.scope
    );

    // Optionally rotate refresh token (revoke old, issue new)
    revokeRefreshToken(refresh_token);
    const newRefreshTokenString = issueRefreshToken(decoded.sub, client_id);
    createRefreshToken(client_id, decoded.sub, newRefreshTokenString);

    return NextResponse.json({
      success: true,
      access_token: newAccessToken,
      refresh_token: newRefreshTokenString,
      token_type: "Bearer",
      expires_in: 3600, // 1 hour in seconds
      refresh_token_expires_in: 604800, // 7 days in seconds
    });
  } catch (err: any) {
    console.error("Refresh token endpoint error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
