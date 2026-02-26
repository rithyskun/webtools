// Compatibility note: this file is used in both Edge and Node runtimes.
// Avoid importing Node-specific modules such as `crypto` so middleware can
// import it without build errors.

export class ApiKeyValidator {
  private readonly apiKeys: Set<string>;

  constructor() {
    const keys = process.env.API_KEYS?.split(',') || [];
    this.apiKeys = new Set(keys.filter((key) => key.length > 0));
  }

  validate(apiKey: string): boolean {
    if (this.apiKeys.size === 0) {
      // no keys configured -> allow all (useful for local development)
      return true;
    }
    return this.apiKeys.has(apiKey);
  }

  static generateApiKey(): string {
    // Try to use Web Crypto when running in Edge/modern Node; fall back to
    // Math.random for environments without it. Not cryptographically secure
    // but good enough for generating test keys.
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    return [...Array(64)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
}

export const apiKeyValidator = new ApiKeyValidator();
