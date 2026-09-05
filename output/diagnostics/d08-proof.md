# D08 Proof and Clean-Database Rehearsal

Generated: 2026-09-05T08:36:42.238Z

## Outcome

The exact same behavior suite passed on the preserved naive baseline and the selected request-scoped DataLoader fix. The suite provisioned a new SQLite file, deployed migrations, seeded it, executed the checks, and removed it after each run.

| Strategy | Behavior checks | Prisma operations | SQL queries | Result |
| --- | ---: | ---: | ---: | :---: |
| naive | 15/15 | 55 | 26 | pass |
| dataloader | 15/15 | 4 | 4 | pass |

The counts above came from the same frontend `PublicFeed` operation on the same clean seed shape: 8 posts, 16 top-level comments, and 6 replies. Durations and counts describe these local runs only; they are not a general performance claim.

## Same behavior checks

| # | Check | naive | dataloader |
| ---: | --- | :---: | :---: |
| 1 | clean migration and repeatable seed | pass | pass |
| 2 | public feed returns seeded nested structure | pass | pass |
| 3 | register hashes password without exposing the hash | pass | pass |
| 4 | login accepts seed email and username | pass | pass |
| 5 | protected mutation rejects missing authentication | pass | pass |
| 6 | authenticated user creates an allowlisted post | pass | pass |
| 7 | unknown image key is rejected | pass | pass |
| 8 | feed keeps newest-post ordering | pass | pass |
| 9 | public profile returns only the requested user's posts | pass | pass |
| 10 | top-level comment stores a null parentId | pass | pass |
| 11 | reply stores the exact top-level parentId | pass | pass |
| 12 | cross-post parent is rejected | pass | pass |
| 13 | reply to a reply is rejected | pass | pass |
| 14 | feed preserves comment and one-level reply structure | pass | pass |
| 15 | failed mutations leave no unexpected records | pass | pass |

Behavior signatures match: yes.

## Clean-database HTTP rehearsal

- migration deployed to an empty SQLite file
- repeatable seed restored 4 users, 8 posts, and 22 comments/replies
- Apollo/Express health endpoint responded
- seed account logged in through HTTP GraphQL
- public feed used the configured DataLoader strategy
- authenticated post creation succeeded
- top-level comment and exact parentId reply succeeded
- public profile and final nested feed contained rehearsal records

The HTTP rehearsal started Apollo Server and Express against another newly migrated and seeded SQLite file. It ended with 4 users, 9 posts, and 24 comments/replies, then removed the disposable database. The measured clean feed used dataloader and recorded 4 Prisma operations.

## Diff and scope review

- Review method: git diff --no-index between the preserved naive and selected DataLoader strategy; the project has no Git metadata.
- Saved patch: `output/diagnostics/d08-naive-to-dataloader.diff`.
- Prisma domain models: User, Post, Comment.
- Forbidden feature terms in the reviewed relation-loading source: none.
- Baseline and fix executed the same GraphQL schema and operation.

## Reproduce

```powershell
npm test
npm run prove:d08
npm run build
```
