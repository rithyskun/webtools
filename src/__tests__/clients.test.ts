import {
  createClient,
  getClient,
  listClients,
  updateClient,
  deleteClient,
  verifyClientSecret,
  generateRandomString,
} from "../lib/clients";

// clear clients before each test
beforeEach(() => {
  // in a real scenario you'd reset the in-memory map
  // for testing we'll just note that tests may interfere with each other
});

describe("clients service", () => {
  it("generates random strings", () => {
    const str1 = generateRandomString(16);
    const str2 = generateRandomString(16);

    expect(str1).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(str2).toHaveLength(32);
    expect(str1).not.toBe(str2);
  });

  it("creates a new client with auto-generated credentials", () => {
    const client = createClient("Test App", ["https://example.com/callback"]);

    expect(client.id).toMatch(/^client_/);
    expect(client.secret).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(client.name).toBe("Test App");
    expect(client.redirectUris).toContain("https://example.com/callback");
    expect(client.allowedScopes).toContain("openid");
    expect(client.createdAt).toBeDefined();
    expect(client.updatedAt).toBeDefined();
  });

  it("retrieves a client by ID", () => {
    const created = createClient("My App", ["https://example.com/callback"]);
    const retrieved = getClient(created.id);

    expect(retrieved).toEqual(created);
  });

  it("returns undefined for non-existent client", () => {
    const retrieved = getClient("nonexistent");
    expect(retrieved).toBeUndefined();
  });

  it("lists all clients", () => {
    const client1 = createClient("App 1", ["https://app1.com/callback"]);
    const client2 = createClient("App 2", ["https://app2.com/callback"]);

    const list = listClients();
    const ids = list.map((c) => c.id);

    expect(ids).toContain(client1.id);
    expect(ids).toContain(client2.id);
  });

  it("verifies client secrets correctly", () => {
    const client = createClient("Verify Test", ["https://example.com/callback"]);

    expect(verifyClientSecret(client.id, client.secret)).toBe(true);
    expect(verifyClientSecret(client.id, "wrong-secret")).toBe(false);
    expect(verifyClientSecret("wrong-id", client.secret)).toBe(false);
  });

  it("updates a client", () => {
    const client = createClient("Original", ["https://example.com/callback"]);
    const updated = updateClient(client.id, {
      name: "Updated Name",
      redirectUris: ["https://newurl.com/callback"],
    });

    expect(updated?.name).toBe("Updated Name");
    expect(updated?.redirectUris).toContain("https://newurl.com/callback");
    expect(updated?.id).toBe(client.id); // ID unchanged
    expect(updated?.secret).toBe(client.secret); // secret unchanged
  });

  it("deletes a client", () => {
    const client = createClient("To Delete", ["https://example.com/callback"]);
    expect(getClient(client.id)).toBeDefined();

    const deleted = deleteClient(client.id);
    expect(deleted).toBe(true);
    expect(getClient(client.id)).toBeUndefined();
  });

  it("returns false when deleting non-existent client", () => {
    const deleted = deleteClient("nonexistent");
    expect(deleted).toBe(false);
  });
});
