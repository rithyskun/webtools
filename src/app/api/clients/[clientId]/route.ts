import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";
import { getClient, updateClient, deleteClient } from "../../../../lib/clients";

/**
 * GET /api/clients/[clientId]
 * Get details for a specific client.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // unauthorized
    }

    const { clientId } = await params;
    const client = getClient(clientId);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // don't expose secret in detail view either
    const { secret, ...safeClient } = client;
    return NextResponse.json({
      success: true,
      client: safeClient,
    });
  } catch (err) {
    console.error("Get client error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clients/[clientId]
 * Update a specific client.
 *
 * Request body can include:
 * {
 *   "name": "Updated App Name",
 *   "redirectUris": ["https://newurl.com/callback"],
 *   "allowedScopes": ["openid", "profile"]
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // unauthorized
    }

    const { clientId } = await params;
    const body = (await request.json()) as Record<string, any>;

    const client = getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const updated = updateClient(clientId, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Could not update client" },
        { status: 400 }
      );
    }

    const { secret, ...safeClient } = updated;
    return NextResponse.json({
      success: true,
      client: safeClient,
    });
  } catch (err) {
    console.error("Update client error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Delete a specific client.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // unauthorized
    }

    const { clientId } = await params;
    const deleted = deleteClient(clientId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted",
    });
  } catch (err) {
    console.error("Delete client error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
