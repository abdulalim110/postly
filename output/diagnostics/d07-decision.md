# D07 Decision — Main Relation-Loading Fix

Decision date: 2026-09-05

## Decision

Use **request-scoped DataLoader** as the main instructor-demo fix. Keep the
naive, Prisma relation-query, and explicit-batching implementations runnable as
comparison paths.

This is a contextual choice for a workshop centered on nested GraphQL field
resolvers. It is not a rule that DataLoader is always the correct solution.

## Evidence used

The exact frontend `PublicFeed` operation ran twice against the same seeded
SQLite database after all four implementations were complete. Both runs
observed the same result shape: 8 posts, 16 top-level comments, and 6 replies.
Every comparison response matched the naive response.

| Strategy | Prisma operations | SQL queries | Same response |
| --- | ---: | ---: | :---: |
| Naive resolver | 55 | 26 | yes |
| Prisma relation query | 1 | 6 | yes |
| Explicit batching | 4 | 4 | yes |
| Request-scoped DataLoader | 4 | 4 | yes |

These are observed counts for the current seed and operation, not universal
performance numbers. The tiny local dataset is not used to make a latency or
production-performance claim. Raw queries, parameters, operation summaries,
source hashes, and the latest run are in `d07-strategy-comparison.json` and
`d07-strategy-comparison.md`.

Two DataLoader executions were also started concurrently. Each received a new
strategy instance and a distinct request trace; both returned the expected
response and recorded 4 Prisma operations. This checks the intended
request-scoped lifecycle without sharing one loader cache globally.

## Trade-off record

### Prisma relation query

- Smallest resolver-time mechanism for this fixed feed shape.
- Observed 6 SQL queries while preserving the response.
- Nested `include` makes the data requirement visible at the root query.
- Couples the root data access to the current nested response shape and may
  load relations that a smaller GraphQL selection does not request.

### Explicit batching

- Observed 4 SQL queries and makes every `IN` query and lookup map explicit.
- Useful for teaching the mechanics of batching and result grouping.
- Requires application code to own scheduling, cache, key ordering, error
  fan-out, and request lifecycle behavior.

### Request-scoped DataLoader

- Observed the same 4 SQL queries and response as explicit batching.
- Keeps field resolvers reusable while sharing one user loader across post,
  comment, and reply authors during a request.
- Uses a maintained batching primitive instead of keeping a home-grown
  scheduler as the main path.
- Requires discipline: create loaders inside request context and return values
  in the same order as input keys.

## Why this is the main demo fix

The demo specifically exposes repeated work from nested field resolvers, so the
DataLoader lifecycle is directly connected to the lesson. Its measured result
matches explicit batching, and its code keeps the resolver-oriented design
without making the root feed query responsible for the entire nested shape.

The decision is not based on query count alone. For a small fixed endpoint,
the Prisma relation-query option remains a reasonable production choice. If a
team does not need reusable field resolvers, that simpler coupling may be the
better trade-off.

## Demo controls

- Normal application requests use `RELATION_STRATEGY=dataloader`.
- `npm run diagnose:baseline` still executes the preserved naive path.
- `npm run diagnose:compare` executes all four paths and rewrites the evidence.
- When `ENABLE_QUERY_LOG=true`, an instructor can send
  `x-postly-relation-strategy: naive|prisma|batch|dataloader` to switch a single
  diagnostic request. Ordinary requests cannot override the configured path
  while query logging is disabled.

## References

- Prisma relation queries: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries
- DataLoader contract and per-request guidance: https://github.com/graphql/dataloader
