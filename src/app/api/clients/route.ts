import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";
import {
  createClient,
  listClients,
  updateClient,
  deleteClient,
  getClient,
} from "../../../lib/clients";

/**
 * GET /api/clients
 * List all registered OAuth clients (admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // unauthorized
    }

    const clients = listClients();
    return NextResponse.json({
      success: true,
      clients: clients.map(({ secret, ...client }) => ({
        ...client,
        // don't expose secret in list view
      })),
    });
  } catch (err) {
    console.error("List clients error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new OAuth client.
 *
 * Request body:
 * {
 *   "name": "My Mobile App",
 *   "redirectUris": ["https://myapp.com/callback"],
 *   "allowedScopes": ["openid", "profile", "email"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // unauthorized
    }

    const body = (await request.json()) as {
      name?: string;
      redirectUris?: string[];
      allowedScopes?: string[];
    };
    const { name, redirectUris, allowedScopes } = body;

    if (!name || !redirectUris || !Array.isArray(redirectUris)) {
      return NextResponse.json(
        {
          success: false,
          error: "name and redirectUris (array) are required",
        },
        { status: 400 }
      );
    }

    const client = createClient(name, redirectUris, allowedScopes);

    return NextResponse.json(
      {
        success: true,
        client,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create client error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
