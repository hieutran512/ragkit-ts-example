# Sample service

This fake service demonstrates symbol-rich TypeScript domains for retrieval benchmarking:

- Token validation with classes/enums/interfaces (`src/auth.ts`)
- In-memory throttling service (`src/rateLimiter.ts`)
- Order repository + service lifecycle (`src/orders.ts`)
- Billing gateway and payment intents (`src/billing.ts`)
- Catalog querying with typed filters (`src/catalog.ts`)

The QA benchmark should verify that questions retrieve the expected file and symbol-level keywords.
