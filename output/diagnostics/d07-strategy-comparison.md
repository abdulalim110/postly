# D07 Relation Strategy Comparison

Generated: 2026-09-05T06:18:22.432Z

Four implementations executed the exact same frontend GraphQL operation against the same seeded local SQLite database. Counts below were captured from those executions; they were not estimated.

## Measurement boundary

- One dedicated Prisma Client and one isolated strategy instance were used per run.
- Each run used the same database, operation, field selection, and ordering.
- The full GraphQL response from each option was compared with the naive response.
- Prisma Client operation count and SQL query count are separate observations.
- This tiny local dataset is not used for a latency or production-performance claim.

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

## Comparison

| Strategy | Prisma operations | SQL queries | Same response |
| --- | ---: | ---: | :---: |
| naive | 55 | 26 | yes |
| prisma | 1 | 6 | yes |
| batch | 4 | 4 | yes |
| dataloader | 4 | 4 | yes |

## Request-scoped DataLoader check

Two DataLoader GraphQL executions were started concurrently with a new strategy instance and query trace for each request. Both matched the expected response and produced distinct trace IDs. Their observed Prisma operation counts were 4 and 4.

## naive

- Result shape: 8 posts, 16 top-level comments, 6 replies
- Response matches naive baseline: yes
- Prisma Client operations: 55
- SQL queries emitted: 26
- Sum of Prisma operation durations: 693.188 ms
- Sum of SQL event durations: 32.507 ms

Durations describe this run only and are not a performance claim.

### Prisma operations by model and action

| Operation | Count |
| --- | ---: |
| `Comment.findMany` | 24 |
| `Post.findMany` | 1 |
| `User.findUniqueOrThrow` | 30 |

### Actual SQL log

#### SQL 1

Duration: 1.299 ms

```sql
SELECT `main`.`Post`.`id`, `main`.`Post`.`authorId`, `main`.`Post`.`caption`, `main`.`Post`.`imageKey`, `main`.`Post`.`createdAt` FROM `main`.`Post` WHERE 1=1 ORDER BY `main`.`Post`.`createdAt` DESC, `main`.`Post`.`id` DESC LIMIT ? OFFSET ?
```

Parameters: `[-1,"0"]`

#### SQL 2

Duration: 2.194 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-01",-1,"0"]`

#### SQL 3

Duration: 1.754 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-02",-1,"0"]`

#### SQL 4

Duration: 1.506 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-03",-1,"0"]`

#### SQL 5

Duration: 1.264 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-04",-1,"0"]`

#### SQL 6

Duration: 1.029 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-05",-1,"0"]`

#### SQL 7

Duration: 0.71 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-06",-1,"0"]`

#### SQL 8

Duration: 0.495 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-07",-1,"0"]`

#### SQL 9

Duration: 0.261 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` = ? AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-08",-1,"0"]`

#### SQL 10

Duration: 2.652 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-01",-1,"0"]`

#### SQL 11

Duration: 2.4 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-02",-1,"0"]`

#### SQL 12

Duration: 2.208 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-03",-1,"0"]`

#### SQL 13

Duration: 2.04 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-04",-1,"0"]`

#### SQL 14

Duration: 1.886 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-05",-1,"0"]`

#### SQL 15

Duration: 1.737 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-06",-1,"0"]`

#### SQL 16

Duration: 1.567 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-07",-1,"0"]`

#### SQL 17

Duration: 1.401 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-08",-1,"0"]`

#### SQL 18

Duration: 1.254 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-09",-1,"0"]`

#### SQL 19

Duration: 1.094 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-10",-1,"0"]`

#### SQL 20

Duration: 0.938 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-11",-1,"0"]`

#### SQL 21

Duration: 0.792 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-12",-1,"0"]`

#### SQL 22

Duration: 0.648 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-13",-1,"0"]`

#### SQL 23

Duration: 0.5 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-14",-1,"0"]`

#### SQL 24

Duration: 0.357 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-15",-1,"0"]`

#### SQL 25

Duration: 0.214 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` = ? ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-16",-1,"0"]`

#### SQL 26

Duration: 0.307 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-sarah","seed-user-alex","seed-user-emily","seed-user-james","seed-user-alex","seed-user-sarah","seed-user-alex","seed-user-emily","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-alex","seed-user-james","seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-james",-1,"0"]`

## prisma

- Result shape: 8 posts, 16 top-level comments, 6 replies
- Response matches naive baseline: yes
- Prisma Client operations: 1
- SQL queries emitted: 6
- Sum of Prisma operation durations: 7.529 ms
- Sum of SQL event durations: 1.591 ms

Durations describe this run only and are not a performance claim.

### Prisma operations by model and action

| Operation | Count |
| --- | ---: |
| `Post.findMany` | 1 |

### Actual SQL log

#### SQL 1

Duration: 0.358 ms

```sql
SELECT `main`.`Post`.`id`, `main`.`Post`.`authorId`, `main`.`Post`.`caption`, `main`.`Post`.`imageKey`, `main`.`Post`.`createdAt` FROM `main`.`Post` WHERE 1=1 ORDER BY `main`.`Post`.`createdAt` DESC, `main`.`Post`.`id` DESC LIMIT ? OFFSET ?
```

Parameters: `[-1,"0"]`

#### SQL 2

Duration: 0.391 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?,?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah",-1,"0"]`

#### SQL 3

Duration: 0.202 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`parentId` IS NULL AND `main`.`Comment`.`postId` IN (?,?,?,?,?,?,?,?)) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-01","seed-post-02","seed-post-03","seed-post-04","seed-post-05","seed-post-06","seed-post-07","seed-post-08",-1,"0"]`

#### SQL 4

Duration: 0.327 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-alex","seed-user-james","seed-user-sarah","seed-user-emily","seed-user-emily","seed-user-james","seed-user-sarah","seed-user-alex","seed-user-james","seed-user-alex","seed-user-alex","seed-user-emily","seed-user-emily","seed-user-sarah","seed-user-james","seed-user-sarah",-1,"0"]`

#### SQL 5

Duration: 0.164 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-15","seed-comment-16","seed-comment-13","seed-comment-14","seed-comment-11","seed-comment-12","seed-comment-09","seed-comment-10","seed-comment-07","seed-comment-08","seed-comment-05","seed-comment-06","seed-comment-03","seed-comment-04","seed-comment-01","seed-comment-02",-1,"0"]`

#### SQL 6

Duration: 0.149 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-james","seed-user-emily","seed-user-sarah","seed-user-james","seed-user-alex","seed-user-emily",-1,"0"]`

## batch

- Result shape: 8 posts, 16 top-level comments, 6 replies
- Response matches naive baseline: yes
- Prisma Client operations: 4
- SQL queries emitted: 4
- Sum of Prisma operation durations: 7.546 ms
- Sum of SQL event durations: 2.203 ms

Durations describe this run only and are not a performance claim.

### Prisma operations by model and action

| Operation | Count |
| --- | ---: |
| `Comment.findMany` | 2 |
| `Post.findMany` | 1 |
| `User.findMany` | 1 |

### Actual SQL log

#### SQL 1

Duration: 0.359 ms

```sql
SELECT `main`.`Post`.`id`, `main`.`Post`.`authorId`, `main`.`Post`.`caption`, `main`.`Post`.`imageKey`, `main`.`Post`.`createdAt` FROM `main`.`Post` WHERE 1=1 ORDER BY `main`.`Post`.`createdAt` DESC, `main`.`Post`.`id` DESC LIMIT ? OFFSET ?
```

Parameters: `[-1,"0"]`

#### SQL 2

Duration: 1.113 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah",-1,"0"]`

#### SQL 3

Duration: 0.326 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` IN (?,?,?,?,?,?,?,?) AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-01","seed-post-02","seed-post-03","seed-post-04","seed-post-05","seed-post-06","seed-post-07","seed-post-08",-1,"0"]`

#### SQL 4

Duration: 0.405 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-01","seed-comment-02","seed-comment-03","seed-comment-04","seed-comment-05","seed-comment-06","seed-comment-07","seed-comment-08","seed-comment-09","seed-comment-10","seed-comment-11","seed-comment-12","seed-comment-13","seed-comment-14","seed-comment-15","seed-comment-16",-1,"0"]`

## dataloader

- Result shape: 8 posts, 16 top-level comments, 6 replies
- Response matches naive baseline: yes
- Prisma Client operations: 4
- SQL queries emitted: 4
- Sum of Prisma operation durations: 7.523 ms
- Sum of SQL event durations: 2.635 ms

Durations describe this run only and are not a performance claim.

### Prisma operations by model and action

| Operation | Count |
| --- | ---: |
| `Comment.findMany` | 2 |
| `Post.findMany` | 1 |
| `User.findMany` | 1 |

### Actual SQL log

#### SQL 1

Duration: 0.773 ms

```sql
SELECT `main`.`Post`.`id`, `main`.`Post`.`authorId`, `main`.`Post`.`caption`, `main`.`Post`.`imageKey`, `main`.`Post`.`createdAt` FROM `main`.`Post` WHERE 1=1 ORDER BY `main`.`Post`.`createdAt` DESC, `main`.`Post`.`id` DESC LIMIT ? OFFSET ?
```

Parameters: `[-1,"0"]`

#### SQL 2

Duration: 1.125 ms

```sql
SELECT `main`.`User`.`id`, `main`.`User`.`name`, `main`.`User`.`username`, `main`.`User`.`email`, `main`.`User`.`passwordHash`, `main`.`User`.`avatarKey`, `main`.`User`.`bio`, `main`.`User`.`createdAt` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?,?,?) LIMIT ? OFFSET ?
```

Parameters: `["seed-user-emily","seed-user-alex","seed-user-james","seed-user-sarah",-1,"0"]`

#### SQL 3

Duration: 0.324 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE (`main`.`Comment`.`postId` IN (?,?,?,?,?,?,?,?) AND `main`.`Comment`.`parentId` IS NULL) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-post-01","seed-post-02","seed-post-03","seed-post-04","seed-post-05","seed-post-06","seed-post-07","seed-post-08",-1,"0"]`

#### SQL 4

Duration: 0.413 ms

```sql
SELECT `main`.`Comment`.`id`, `main`.`Comment`.`postId`, `main`.`Comment`.`authorId`, `main`.`Comment`.`parentId`, `main`.`Comment`.`content`, `main`.`Comment`.`createdAt` FROM `main`.`Comment` WHERE `main`.`Comment`.`parentId` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ORDER BY `main`.`Comment`.`createdAt` ASC, `main`.`Comment`.`id` ASC LIMIT ? OFFSET ?
```

Parameters: `["seed-comment-01","seed-comment-02","seed-comment-03","seed-comment-04","seed-comment-05","seed-comment-06","seed-comment-07","seed-comment-08","seed-comment-09","seed-comment-10","seed-comment-11","seed-comment-12","seed-comment-13","seed-comment-14","seed-comment-15","seed-comment-16",-1,"0"]`
