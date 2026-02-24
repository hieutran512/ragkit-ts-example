export interface RateLimitBucket {
    count: number;
    resetAt: number;
}

export interface RateLimitDecision {
    allowed: boolean;
    retryAfterSec: number;
    remaining: number;
}

export class InMemoryRateLimiter {
    private readonly buckets = new Map<string, RateLimitBucket>();

    constructor(private readonly maxPerMinute: number = 60) { }

    consume(clientId: string): RateLimitDecision {
        const now = Date.now();
        const bucket = this.getOrCreateBucket(clientId, now);

        if (bucket.count >= this.maxPerMinute) {
            return {
                allowed: false,
                retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
                remaining: 0,
            };
        }

        bucket.count += 1;
        return {
            allowed: true,
            retryAfterSec: 0,
            remaining: this.maxPerMinute - bucket.count,
        };
    }

    private getOrCreateBucket(clientId: string, now: number): RateLimitBucket {
        const current = this.buckets.get(clientId);
        if (!current || now >= current.resetAt) {
            const fresh: RateLimitBucket = {
                count: 0,
                resetAt: now + 60_000,
            };
            this.buckets.set(clientId, fresh);
            return fresh;
        }
        return current;
    }
}

const limiter = new InMemoryRateLimiter(60);

export function checkRateLimit(clientId: string): RateLimitDecision {
    return limiter.consume(clientId);
}
