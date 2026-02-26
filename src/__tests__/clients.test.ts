jest.setTimeout(120000);
import {
  createClient,
  getClient,
  listClients,
  updateClient,
  deleteClient,
  verifyClientSecret,
  generateRandomString,
} from "../lib/clients";

import { setupTestDb, teardownTestDb } from "./setupDb";
import { getDb } from "../lib/db";

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

describe("clients service", () => {
  it("generates random strings", () => {
    const str1 = generateRandomString(16);
    const str2 = generateRandomString(16);

    expect(str1).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(str2).toHaveLength(32);
    expect(str1).not.toBe(str2);
  });

  it("creates a new client with auto-generated credentials", async () => {
    const client = await createClient("Test App", ["https://example.com/callback"]);

    expect(client.id).toMatch(/^client_/);
    expect(client.secret).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(client.name).toBe("Test App");
    expect(client.redirectUris).toContain("https://example.com/callback");
    expect(client.allowedScopes).toContain("openid");
    expect(client.createdAt).toBeDefined();
    expect(client.updatedAt).toBeDefined();
  });

  it("retrieves a client by ID", async () => {
    const created = await createClient("My App", ["https://example.com/callback"]);
    const retrieved = await getClient(created.id);

    expect(retrieved).toEqual(created);
  });

  it("returns null for non-existent client", async () => {
    const retrieved = await getClient("nonexistent");
    expect(retrieved).toBeNull();
  });

  it("lists all clients", async () => {
    const client1 = await createClient("App 1", ["https://app1.com/callback"]);
    const client2 = await createClient("App 2", ["https://app2.com/callback"]);

    const list = await listClients();
    const ids = list.map((c) => c.id);

    expect(ids).toContain(client1.id);
    expect(ids).toContain(client2.id);
  });

  it("verifies client secrets correctly", async () => {
    const client = await createClient("Verify Test", ["https://example.com/callback"]);

    expect(await verifyClientSecret(client.id, client.secret)).toBe(true);
    expect(await verifyClientSecret(client.id, "wrong-secret")).toBe(false);
    expect(await verifyClientSecret("wrong-id", client.secret)).toBe(false);
  });

  it("updates a client", async () => {
    const client = await createClient("Original", ["https://example.com/callback"]);
    const updated = await updateClient(client.id, {
      name: "Updated Name",
      redirectUris: ["https://newurl.com/callback"],
    });

    expect(updated?.name).toBe("Updated Name");
    expect(updated?.redirectUris).toContain("https://newurl.com/callback");
    expect(updated?.id).toBe(client.id); // ID unchanged
    expect(updated?.secret).toBe(client.secret); // secret unchanged
  });

  it("deletes a client", async () => {
    const client = await createClient("To Delete", ["https://example.com/callback"]);
    const retrieved1 = await getClient(client.id);
    expect(retrieved1).toBeDefined();

    const deleted = await deleteClient(client.id);
    expect(deleted).toBe(true);
    const retrieved2 = await getClient(client.id);
    expect(retrieved2).toBeNull();
  });

  it("returns false when deleting non-existent client", async () => {
    const deleted = await deleteClient("nonexistent");
    expect(deleted).toBe(false);
  });
});
