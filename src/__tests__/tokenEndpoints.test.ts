jest.setTimeout(120000);
import { setupTestDb, teardownTestDb } from "./setupDb";
import { createClient } from "../lib/clients";
import { issueAccessToken } from "../lib/tokenService";
import { GET, POST as tokenPost } from "../app/api/auth/token/route";
import { POST as refreshPost } from "../app/api/auth/refresh/route";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../lib/db";

// helper to build NextRequest-like object
function buildRequest(body: any, headers: Record<string,string> = {}) {
  return new NextRequest("http://localhost/api/", { method: "POST", body: JSON.stringify(body), headers });
}

describe("token endpoint integration", () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    // Clear database collections between tests
    const db = await getDb();
    await db.collection("clients").deleteMany({});
    await db.collection("refresh_tokens").deleteMany({});
  });

  it("issues and returns tokens for valid session and client", async () => {
    const client = await createClient("Test", ["https://callback"]);
    // simulate NextAuth token payload
    const fakeToken = { sub: "user1", email: "u@e.com", name: "User" };

    const req = buildRequest({ client_id: client.id });
    // monkeypatch getToken used in handler
    jest.spyOn(require("next-auth/jwt"), "getToken").mockResolvedValue(fakeToken);

    const res = await tokenPost(req as any);
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.success).toBe(true);
    expect(json.access_token).toBeDefined();
    expect(json.refresh_token).toBeDefined();
  });

  it("rejects unknown client on token request", async () => {
    const fakeToken = { sub: "user1" };
    jest.spyOn(require("next-auth/jwt"), "getToken").mockResolvedValue(fakeToken);
    const req = buildRequest({ client_id: "doesnotexist" });
    const res = await tokenPost(req as any);
    expect(res.status).toBe(400);
  });

  it("refresh endpoint rotates tokens", async () => {
    const client = await createClient("Test2", ["https://callback"]);
    // issue initial tokens
    const access = issueAccessToken("user2", client.id);
    const refresh = issueAccessToken("user2", client.id); // reuse simple token for test
    // store refresh
    const { createRefreshToken } = require("../lib/clients");
    await createRefreshToken(client.id, "user2", refresh);

    const req = buildRequest({ refresh_token: refresh, client_id: client.id });
    const res = await refreshPost(req as any);
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.access_token).toBeDefined();
    expect(json.refresh_token).toBeDefined();
    expect(json.refresh_token).not.toBe(refresh);
  });
});

