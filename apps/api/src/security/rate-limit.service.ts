import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<number>;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  key: string;
}

class InMemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.expiresAt <= now) {
      this.buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return 1;
    }

    existing.count += 1;
    return existing.count;
  }
}

@Injectable()
export class RateLimitService {
  constructor(
    private readonly store: RateLimitStore = new InMemoryRateLimitStore(),
    private readonly options: RateLimitOptions = {
      limit: 60,
      windowMs: 60_000,
      keyPrefix: "api",
    },
  ) {}

  async check(societyId: string, actorId: string, action: string): Promise<RateLimitDecision> {
    const key = `${this.options.keyPrefix}:${societyId}:${actorId}:${action}`;
    const count = await this.store.increment(key, this.options.windowMs);
    const remaining = Math.max(this.options.limit - count, 0);

    return {
      allowed: count <= this.options.limit,
      limit: this.options.limit,
      remaining,
      key,
    };
  }

  async checkOrThrow(societyId: string, actorId: string, action: string): Promise<RateLimitDecision> {
    const decision = await this.check(societyId, actorId, action);

    if (!decision.allowed) {
      throw new HttpException(
        {
          error: "rate_limit_exceeded",
          key: decision.key,
          limit: decision.limit,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return decision;
  }
}
