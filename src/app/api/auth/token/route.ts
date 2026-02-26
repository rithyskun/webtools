import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getClient, createRefreshToken } from "../../../../lib/clients";
import { issueAccessToken, issueRefreshToken } from "../../../../lib/tokenService";

/**
 * POST /api/auth/token
 *
 * Exchange NextAuth session for access + refresh tokens.
 * Requires the user to be authenticated and a valid client_id in the request.
 *
 * Request body:
 * {
 *   "client_id": "client_xxx",
 *   "scope": "openid profile email" (optional)
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJ...",
 *   "refresh_token": "eyJ...",
 *   "token_type": "Bearer",
 *   "expires_in": 3600
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      client_id?: string;
      scope?: string;
    };
    const { client_id, scope } = body;

    if (!client_id) {
      return NextResponse.json(
        { success: false, error: "client_id is required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = getClient(client_id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Invalid client_id" },
        { status: 400 }
      );
    }

    // Validate requested scope against client's allowed scopes
    if (scope) {
      const requestedScopes = scope.split(" ");
      const unauthorized = requestedScopes.some(
        (s) => !client.allowedScopes.includes(s)
      );
      if (unauthorized) {
        return NextResponse.json(
          { success: false, error: "Client is not authorized for requested scope" },
          { status: 403 }
        );
      }
    }

    // Issue access token
    const accessToken = issueAccessToken(
      token.sub || "",
      client_id,
      token.email as string,
      token.name as string,
      scope
    );

    // Issue refresh token
    const refreshTokenString = issueRefreshToken(token.sub || "", client_id);

    // Store refresh token in database
    const storedRefreshToken = createRefreshToken(
      client_id,
      token.sub || "",
      refreshTokenString
    );

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshTokenString,
      token_type: "Bearer",
      expires_in: 3600, // 1 hour in seconds
      refresh_token_expires_in: 604800, // 7 days in seconds
    });
  } catch (err: any) {
    console.error("Token endpoint error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/token (optional, for debugging)
 * Returns information about the current token if valid.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You are authenticated. POST with client_id to get access tokens.",
      currentUser: {
        id: token.sub,
        email: token.email,
        name: token.name,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
