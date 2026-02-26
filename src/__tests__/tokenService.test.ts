import {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../lib/tokenService";

describe("tokenService", () => {
  it("issues and verifies access tokens", () => {
    const token = issueAccessToken("user-123", "client-456", "user@example.com");
    const decoded = verifyAccessToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("user-123");
    expect(decoded?.aud).toBe("client-456");
    expect(decoded?.email).toBe("user@example.com");
  });

  it("issues and verifies refresh tokens", () => {
    const token = issueRefreshToken("user-123", "client-456");
    const decoded = verifyRefreshToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("user-123");
    expect(decoded?.aud).toBe("client-456");
  });

  it("rejects invalid tokens", () => {
    const decoded = verifyAccessToken("invalid.token.here");
    expect(decoded).toBeNull();
  });

  it("includes scope in token payload", () => {
    const token = issueAccessToken(
      "user-123",
      "client-456",
      "user@example.com",
      "User Name",
      "openid profile email"
    );
    const decoded = verifyAccessToken(token);

    expect(decoded?.scope).toBe("openid profile email");
  });

  it("includes iat and exp claims", () => {
    const beforeTime = Math.floor(Date.now() / 1000);
    const token = issueAccessToken("user-123", "client-456");
    const decoded = verifyAccessToken(token);
    const afterTime = Math.floor(Date.now() / 1000);

    expect(decoded?.iat).toBeGreaterThanOrEqual(beforeTime);
    expect(decoded?.iat).toBeLessThanOrEqual(afterTime);
    expect(decoded?.exp).toBeGreaterThan(decoded?.iat || 0);
  });
});
