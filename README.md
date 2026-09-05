# Postly Instructor Demo

Instructor-only implementation of the Postly workshop application. Dokumentasi
boleh mengikuti bahasa pengguna; bahasa Inggris tidak menjadi syarat kerja
repository.

## Working documents

- `AGENTS.md` adalah pointer ringkas untuk auto-discovery.
- `docs/AGENTS.md` berisi aturan stabil dan guardrail repository.
- `docs/plans/2026-09-05/01-build-break-diagnose-decide-fix-prove.md` menyimpan
  checklist dan log evidence implementasi awal yang sudah selesai.
- `docs/facilitation/OPTIONAL-R2-IMAGE-UPLOAD.md` adalah playbook instructor
  bila peserta meminta pembahasan image upload setelah materi utama selesai.
- Perubahan dengan outcome atau akar masalah baru menggunakan plan bertanggal
  baru di `docs/plans/`, bukan checklist permanen di `AGENTS.md`.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## First local setup

```powershell
Copy-Item backend/.env.example backend/.env
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at
`http://localhost:4000`.

## GraphQL stack

- The Express 5 backend serves Apollo Server at `/graphql`.
- The React frontend uses Apollo Client with `ApolloProvider`, `HttpLink`, and
  `InMemoryCache`.
- Queries use `useQuery`; mutations use `useMutation`.
- The client reads the local JWT session for each request and sends it as a
  bearer token when present.

The schema, resolver structure, and endpoint remain intentionally small so the
workshop can focus on relation-query diagnosis rather than client plumbing.

Prisma ORM is pinned to 7.10.0. The checked-in migration creates only the
`User`, `Post`, and `Comment` domain tables. Run `npm run db:migrate` while
developing schema changes. Prisma 7 does not seed automatically after a reset,
so run `npm run db:seed` explicitly whenever the demo data is needed again.

### Instructor seed account

```text
Email:    alex@postly.local
Username: alex.morgan
Password: PostlyDemo123!
```

The seed command can be run repeatedly. It replaces records whose IDs begin
with `seed-` without duplicating them and leaves non-seed records alone.

Useful checks:

```text
GET  http://localhost:4000/api/health
POST http://localhost:4000/graphql
```

D03 exposes `register`, `login`, and authenticated `me` operations on the
GraphQL endpoint. Login accepts either email or username. JWT values come from
the local environment, passwords are stored as bcrypt hashes, and
`passwordHash` is not part of the GraphQL `User` type.

## Product behavior

D04 adds the complete small product flow:

- `/feed` is public and shows newest posts first.
- `/posts/new` requires login and accepts one of the five bundled image keys.
- Each post accepts top-level comments and one reply level. Replies are stored
  through `Comment.parentId`; replying to a reply is rejected.
- `/users/:username` is public and shows only that user's posts.

The matching GraphQL operations are `feed`, `user`, `createPost`, and
`createComment`. Post and comment mutations require a bearer token. Image keys,
caption length, comment length, reply depth, and parent/post consistency are
validated by the backend rather than trusted from the UI.

The original straightforward per-parent relation implementation remains
available as the diagnosis baseline. The normal instructor-demo path now uses
the D07 relation strategy selected after an equal-input comparison.

## Local static assets

The D02 asset pack is bundled below `frontend/public/images`:

- Five 1200 × 800 WebP post choices in `images/posts`.
- Four 512 × 512 WebP seed avatars in `images/avatars`.

The frontend source contains no non-local HTTP(S) asset references. The prompt
record and generation constraints are documented in
`docs/assets/ASSET-PROMPTS.md`.

## Visual QA

D05 matches the supplied Postly UI references while retaining the deliberately
small product scope. Desktop, mobile, loading, empty, validation, error, caption
limit, and long-content renders are stored in `output/d05-rendered`.

The final Apollo-based pass found no page-level horizontal overflow or broken
images. Riwayat visual QA dan diagnosis dapat ditelusuri dari completed plan di
`docs/plans/2026-09-05/01-build-break-diagnose-decide-fix-prove.md`.

## Diagnose baseline

D06 keeps the straightforward relation resolvers as the working baseline and
adds two deliberately separate measurements:

- Set `ENABLE_QUERY_LOG=true` and send `x-postly-query-trace: true` to receive
  request-scoped Prisma Client operations in `extensions.queryTrace`.
- Run `npm run diagnose:baseline` to execute the frontend feed operation once
  with a dedicated Prisma Client and record the actual SQL query events.

The response trace is opt-in and does not include SQL text or query arguments.
It reports Prisma Client operations, which must not be presented as the SQL
query count because Prisma can batch compatible operations internally.

The latest generated baseline is stored in:

- `output/diagnostics/d06-baseline-feed.md`
- `output/diagnostics/d06-baseline-feed.json`

With the current seed of 8 posts, 16 top-level comments, and 6 replies, the
recorded run observed 55 Prisma Client operations and 26 SQL queries. Rerun the
command instead of reusing those numbers after changing the seed or resolver
implementation.

## Decide and fix

D07 keeps four relation-loading paths behind one resolver interface:

- `naive`: the preserved working baseline.
- `prisma`: nested Prisma `include` queries.
- `batch`: explicit `findMany` batching and lookup maps.
- `dataloader`: request-scoped DataLoader instances.

Run the exact same frontend feed operation through every path with:

```powershell
npm run diagnose:compare
```

The latest evidence is stored in
`output/diagnostics/d07-strategy-comparison.md` and `.json`; the trade-off and
main-fix rationale are in `output/diagnostics/d07-decision.md`. On the current
seed, the measured SQL counts were 26 for naive, 6 for Prisma relation queries,
and 4 each for explicit batching and DataLoader. Every response matched the
baseline. These local measurements are evidence for this scenario, not a
general latency claim.

The main demo uses `RELATION_STRATEGY=dataloader` because the workshop focuses
on nested GraphQL field resolvers and request lifecycle. It was selected after
comparison, not treated as an automatic answer. With `ENABLE_QUERY_LOG=true`,
an instructor can set `x-postly-relation-strategy` to `naive`, `prisma`,
`batch`, or `dataloader` for one diagnostic request.

## Prove and rehearsal

D08 runs one shared 15-check behavior suite against both the preserved naive
baseline and the selected DataLoader fix:

```powershell
npm test
```

Generate the before/after query evidence, no-index strategy diff, and a complete
HTTP rehearsal from an empty database with:

```powershell
npm run prove:d08
```

Every run uses a disposable SQLite file. The proof command deploys the checked-
in migration, runs the repeatable seed, exercises the application, and removes
the temporary database without changing `backend/dev.db`.

The generated artifacts are:

- `output/diagnostics/d08-proof.md`
- `output/diagnostics/d08-proof.json`
- `output/diagnostics/d08-naive-to-dataloader.diff`

On the current clean seed, both strategies passed all 15 behavior checks. The
same `PublicFeed` operation recorded 55 Prisma operations / 26 SQL queries for
the naive baseline and 4 Prisma operations / 4 SQL queries for DataLoader.
These are local observations for the recorded operation and dataset, not
general performance or latency claims.
