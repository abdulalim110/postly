# D06 Baseline Feed Evidence

Generated: 2026-09-05T05:48:11.146Z

This file is generated from one real GraphQL execution against the seeded local
SQLite database. Do not edit the observed counts manually.

## Measurement boundary

- Relation resolvers remain in the naive baseline implementation.
- One dedicated Prisma Client and one GraphQL operation were used, with no
  concurrent request in the evidence process.
- Prisma operation count and SQL query count are recorded separately because
  Prisma can batch compatible client operations internally.

## GraphQL operation

```graphql
query PublicFeed {
  feed {
    id
    caption
    imageKey
    createdAt
    author {
      id
      name
      username
      avatarKey
    }
    comments {
      id
      postId
      parentId
      content
      createdAt
      author {
        id
        name
        username
        avatarKey
      }
      replies {
        id
        postId
        parentId
        content
        createdAt
        author {
          id
          name
          username
          avatarKey
        }
      }
    }
  }
}
```

## Observed result shape

- Posts: 8
- Top-level comments: 16
- Replies: 6

## Observed counts

- Prisma Client operations: 55
- SQL queries emitted: 26
- Sum of Prisma operation durations: 704.968 ms
- Sum of SQL event durations: 32.859 ms

Durations describe this run only and are not a performance claim.

## Prisma operations by model and action

| Operation | Count |
| --- | ---: |
| `Comment.findMany` | 24 |
| `Post.findMany` | 1 |
| `User.findUniqueOrThrow` | 30 |

## Preserved resolver baseline

| Source | SHA-256 |
| --- | --- |
| `backend/src/resolvers/Query.js` | `e03f31a6e90bb733b0132d4aa7ac552cb61c4ecca2c10702deee80e332d72ca2` |
| `backend/src/resolvers/Post.js` | `43ef67a1fc3f5697ef3a0b9aeddc953a88dd2ade5195fc08f4703a31bedc70ee` |
| `backend/src/resolvers/Comment.js` | `bb9793159f9ae2bc85406ddc6ca7d446ccc8367166884ffe54c64bec285a9c53` |
| `backend/src/resolvers/User.js` | `0b17afa8a701557786fca776c7cb5af1d76bea8a77242f010eb62fb0eb78249a` |

## Actual SQL log

### SQL 1

Duration: 1.125 ms

```sql
SELECT `main`.`Post`.`id`, `main`.`Post`.`authorId`, `main`.`Post`.`caption`, `main`.`Post`.`imageKey`, `main`.`Post`.`createdAt` FROM `main`.`Post` WHERE 1=1 ORDER BY `main`.`Post`.`createdAt` DESC, `main`.`Post`.`id` DESC LIMIT ? OFFSET ?
```

Parameters: `[-1,"0"]`

### SQL 2

Duration: 2.15 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-01",-1,"0"]`

### SQL 3

Duration: 1.697 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-02",-1,"0"]`

### SQL 4

Duration: 1.439 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-03",-1,"0"]`

### SQL 5

Duration: 1.193 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-04",-1,"0"]`

### SQL 6

Duration: 0.967 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-05",-1,"0"]`

### SQL 7

Duration: 0.74 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-06",-1,"0"]`

### SQL 8

Duration: 0.509 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-07",-1,"0"]`

### SQL 9

Duration: 0.265 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-08",-1,"0"]`

### SQL 10

Duration: 2.813 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-01",-1,"0"]`

### SQL 11

Duration: 2.473 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-02",-1,"0"]`

### SQL 12

Duration: 2.285 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-03",-1,"0"]`

### SQL 13

Duration: 2.085 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-04",-1,"0"]`

### SQL 14

Duration: 1.923 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-05",-1,"0"]`

### SQL 15

Duration: 1.766 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-06",-1,"0"]`

### SQL 16

Duration: 1.608 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-07",-1,"0"]`

### SQL 17

Duration: 1.451 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-08",-1,"0"]`

### SQL 18

Duration: 1.302 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-09",-1,"0"]`

### SQL 19

Duration: 1.137 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-10",-1,"0"]`

### SQL 20

Duration: 0.975 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-11",-1,"0"]`

### SQL 21

Duration: 0.822 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-12",-1,"0"]`

### SQL 22

Duration: 0.675 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-13",-1,"0"]`

### SQL 23

Duration: 0.524 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-14",-1,"0"]`

### SQL 24

Duration: 0.375 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-15",-1,"0"]`

### SQL 25

Duration: 0.229 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-16",-1,"0"]`

### SQL 26

Duration: 0.331 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-sarah","seed-user-alex","seed-user-emily","seed-user-james","seed-user-alex","seed-user-sarah","seed-user-alex","seed-user-emily","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-alex","seed-user-james","seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-james",-1,"0"]`
