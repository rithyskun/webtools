interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }) {
    this.config = config;
    this.cleanupExpired();
  }

  private cleanupExpired(): void {
    setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, this.config.windowMs);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || record.resetTime < now) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[identifier].resetTime,
      };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  reset(identifier: string): void {
    delete this.store[identifier];
  }
}

export const globalRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 100,
});

export const webhookRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 50,
});

export const emailRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 20,
});
