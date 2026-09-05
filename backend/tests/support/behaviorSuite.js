import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { graphql, print } from "graphql";
import { FEED_QUERY } from "../../../frontend/src/graphql.js";
import { readAccessToken } from "../../src/auth.js";
import { PrismaClient } from "../../src/generated/prisma/client.ts";
import {
  createQueryTrace,
  instrumentPrismaForRequest,
  summarizeQueryTrace,
} from "../../src/instrumentation/queryTrace.js";
import { createRelationStrategy } from "../../src/relationStrategies/index.js";
import { schema } from "../../src/schema.js";
import {
  provisionTestDatabase,
  removeTestDatabase,
} from "./testDatabase.js";

const TEST_PASSWORD = "ProofPassword123!";
const SEED_PASSWORD = "PostlyDemo123!";

process.env.JWT_SECRET ??= "postly-d08-test-secret-at-least-32-characters";
process.env.JWT_EXPIRES_IN ??= "1h";

const OPERATIONS = {
  register: `
    mutation D08Register($input: RegisterInput!) {
      register(input: $input) {
        token
        user { id name username email avatarKey bio }
      }
    }
  `,
  login: `
    mutation D08Login($identifier: String!, $password: String!) {
      login(identifier: $identifier, password: $password) {
        token
        user { id username email }
      }
    }
  `,
  createPost: `
    mutation D08CreatePost($caption: String!, $imageKey: String!) {
      createPost(caption: $caption, imageKey: $imageKey) {
        id caption imageKey createdAt
      }
    }
  `,
  createComment: `
    mutation D08CreateComment($postId: ID!, $parentId: ID, $content: String!) {
      createComment(postId: $postId, parentId: $parentId, content: $content) {
        id postId parentId content createdAt
      }
    }
  `,
  profile: `
    query D08Profile($username: String!) {
      user(username: $username) {
        id username
        posts { id caption imageKey createdAt }
      }
    }
  `,
};

function roundMilliseconds(value) {
  return Math.round(value * 1000) / 1000;
}

function operationSummary(entries) {
  return Object.entries(
    entries.reduce((counts, entry) => {
      const key = `${entry.model}.${entry.operation}`;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([operationName, count]) => ({ operationName, count }));
}

function expectSuccess(execution) {
  assert.equal(execution.result.errors, undefined);
  assert.ok(execution.result.data);
  return execution.result.data;
}

function expectErrorCode(execution, expectedCode) {
  assert.equal(execution.result.errors?.[0]?.extensions?.code, expectedCode);
}

function authFromToken(token) {
  const auth = readAccessToken(`Bearer ${token}`);
  assert.ok(auth);
  return auth;
}

export async function runBehaviorSuite(strategyName) {
  const database = await provisionTestDatabase(strategyName);
  const sqlEntries = [];
  const checks = [];
  const adapter = new PrismaBetterSqlite3({ url: database.databaseUrl });
  const prisma = new PrismaClient({
    adapter,
    log: [{ emit: "event", level: "query" }],
  });

  prisma.$on("query", (event) => {
    sqlEntries.push({
      sequence: sqlEntries.length + 1,
      durationMs: roundMilliseconds(event.duration),
      query: event.query,
      params: event.params,
    });
  });

  async function execute({
    source,
    operationName,
    variables = {},
    auth = null,
    traceEnabled = false,
  }) {
    const queryTrace = createQueryTrace({
      enabled: traceEnabled,
      operationName,
      relationStrategy: strategyName,
    });
    const requestPrisma = instrumentPrismaForRequest(prisma, queryTrace);
    const relations = createRelationStrategy(strategyName, requestPrisma);
    const sqlStart = sqlEntries.length;
    const result = await graphql({
      schema,
      source,
      variableValues: variables,
      operationName,
      contextValue: {
        prisma: requestPrisma,
        auth,
        queryTrace,
        relations,
        relationStrategy: strategyName,
      },
    });

    return {
      result,
      requestTrace: summarizeQueryTrace(queryTrace),
      sql: sqlEntries.slice(sqlStart),
    };
  }

  try {
    const cleanSeedCounts = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
    };
    assert.deepEqual(cleanSeedCounts, { users: 4, posts: 8, comments: 22 });
    checks.push("clean migration and repeatable seed");

    sqlEntries.length = 0;
    const measuredFeed = await execute({
      source: print(FEED_QUERY),
      operationName: "PublicFeed",
      traceEnabled: true,
    });
    const measuredFeedData = expectSuccess(measuredFeed);
    const measuredShape = {
      posts: measuredFeedData.feed.length,
      topLevelComments: measuredFeedData.feed.reduce(
        (total, post) => total + post.comments.length,
        0,
      ),
      replies: measuredFeedData.feed.reduce(
        (total, post) =>
          total +
          post.comments.reduce(
            (commentTotal, comment) =>
              commentTotal + comment.replies.length,
            0,
          ),
        0,
      ),
    };
    assert.deepEqual(measuredShape, {
      posts: 8,
      topLevelComments: 16,
      replies: 6,
    });
    checks.push("public feed returns seeded nested structure");

    const registerExecution = await execute({
      source: OPERATIONS.register,
      operationName: "D08Register",
      variables: {
        input: {
          name: "Proof User",
          username: "proof.user",
          email: "proof.user@postly.local",
          password: TEST_PASSWORD,
        },
      },
    });
    const registerData = expectSuccess(registerExecution).register;
    const registeredRecord = await prisma.user.findUniqueOrThrow({
      where: { id: registerData.user.id },
    });
    assert.notEqual(registeredRecord.passwordHash, TEST_PASSWORD);
    assert.equal(
      await bcrypt.compare(TEST_PASSWORD, registeredRecord.passwordHash),
      true,
    );
    assert.equal(JSON.stringify(registerData).includes("passwordHash"), false);
    checks.push("register hashes password without exposing the hash");

    for (const identifier of ["alex@postly.local", "alex.morgan"]) {
      const loginExecution = await execute({
        source: OPERATIONS.login,
        operationName: "D08Login",
        variables: { identifier, password: SEED_PASSWORD },
      });
      const loginData = expectSuccess(loginExecution).login;
      assert.equal(loginData.user.username, "alex.morgan");
      assert.equal(authFromToken(loginData.token).userId, "seed-user-alex");
    }
    checks.push("login accepts seed email and username");

    const unauthenticatedPost = await execute({
      source: OPERATIONS.createPost,
      operationName: "D08CreatePost",
      variables: { caption: "Should fail", imageKey: "coffee" },
    });
    expectErrorCode(unauthenticatedPost, "UNAUTHENTICATED");
    checks.push("protected mutation rejects missing authentication");

    const proofAuth = authFromToken(registerData.token);
    const postExecution = await execute({
      source: OPERATIONS.createPost,
      operationName: "D08CreatePost",
      variables: {
        caption: "D08 proof post",
        imageKey: "coffee",
      },
      auth: proofAuth,
    });
    const createdPost = expectSuccess(postExecution).createPost;
    assert.equal(createdPost.caption, "D08 proof post");
    assert.equal(createdPost.imageKey, "coffee");
    checks.push("authenticated user creates an allowlisted post");

    const invalidImageExecution = await execute({
      source: OPERATIONS.createPost,
      operationName: "D08CreatePost",
      variables: { caption: "Invalid image", imageKey: "not-in-gallery" },
      auth: proofAuth,
    });
    expectErrorCode(invalidImageExecution, "BAD_USER_INPUT");
    checks.push("unknown image key is rejected");

    const newestFeedExecution = await execute({
      source: print(FEED_QUERY),
      operationName: "PublicFeed",
    });
    const newestFeed = expectSuccess(newestFeedExecution).feed;
    assert.equal(newestFeed[0].id, createdPost.id);
    checks.push("feed keeps newest-post ordering");

    const profileExecution = await execute({
      source: OPERATIONS.profile,
      operationName: "D08Profile",
      variables: { username: "PROOF.USER" },
    });
    const profile = expectSuccess(profileExecution).user;
    assert.equal(profile.username, "proof.user");
    assert.deepEqual(
      profile.posts.map((post) => post.id),
      [createdPost.id],
    );
    checks.push("public profile returns only the requested user's posts");

    const topLevelExecution = await execute({
      source: OPERATIONS.createComment,
      operationName: "D08CreateComment",
      variables: {
        postId: createdPost.id,
        parentId: null,
        content: "D08 top-level comment",
      },
      auth: proofAuth,
    });
    const topLevelComment = expectSuccess(topLevelExecution).createComment;
    assert.equal(topLevelComment.parentId, null);
    checks.push("top-level comment stores a null parentId");

    const replyExecution = await execute({
      source: OPERATIONS.createComment,
      operationName: "D08CreateComment",
      variables: {
        postId: createdPost.id,
        parentId: topLevelComment.id,
        content: "D08 reply",
      },
      auth: proofAuth,
    });
    const reply = expectSuccess(replyExecution).createComment;
    assert.equal(reply.parentId, topLevelComment.id);
    checks.push("reply stores the exact top-level parentId");

    const crossPostExecution = await execute({
      source: OPERATIONS.createComment,
      operationName: "D08CreateComment",
      variables: {
        postId: "seed-post-01",
        parentId: topLevelComment.id,
        content: "Cross-post reply",
      },
      auth: proofAuth,
    });
    expectErrorCode(crossPostExecution, "BAD_USER_INPUT");
    checks.push("cross-post parent is rejected");

    const nestedReplyExecution = await execute({
      source: OPERATIONS.createComment,
      operationName: "D08CreateComment",
      variables: {
        postId: createdPost.id,
        parentId: reply.id,
        content: "Nested reply",
      },
      auth: proofAuth,
    });
    expectErrorCode(nestedReplyExecution, "BAD_USER_INPUT");
    checks.push("reply to a reply is rejected");

    const finalFeedExecution = await execute({
      source: print(FEED_QUERY),
      operationName: "PublicFeed",
    });
    const finalFeed = expectSuccess(finalFeedExecution).feed;
    const proofPost = finalFeed.find((post) => post.id === createdPost.id);
    assert.ok(proofPost);
    assert.equal(proofPost.comments.length, 1);
    assert.equal(proofPost.comments[0].id, topLevelComment.id);
    assert.equal(proofPost.comments[0].replies.length, 1);
    assert.equal(proofPost.comments[0].replies[0].id, reply.id);
    assert.equal(
      proofPost.comments[0].replies[0].parentId,
      topLevelComment.id,
    );
    checks.push("feed preserves comment and one-level reply structure");

    const finalCounts = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
    };
    assert.deepEqual(finalCounts, { users: 5, posts: 9, comments: 24 });
    checks.push("failed mutations leave no unexpected records");

    const requestTrace = measuredFeed.requestTrace;
    return {
      strategy: strategyName,
      passed: true,
      checks,
      cleanDatabase: {
        migrationApplied: /migration|database schema is up to date/i.test(
          database.migrationOutput,
        ),
        seedOutput: database.seedOutput,
        seedCounts: cleanSeedCounts,
        removedAfterRun: true,
      },
      behaviorSignature: {
        checks,
        cleanSeedCounts,
        measuredShape,
        finalCounts,
      },
      queryEvidence: {
        operationName: "PublicFeed",
        resultShape: measuredShape,
        traceId: requestTrace.traceId,
        prismaOperationCount: requestTrace.prismaOperationCount,
        totalPrismaDurationMs: requestTrace.totalPrismaDurationMs,
        operationSummary: operationSummary(requestTrace.operations),
        sqlQueryCount: measuredFeed.sql.length,
        totalSqlDurationMs: roundMilliseconds(
          measuredFeed.sql.reduce(
            (total, entry) => total + entry.durationMs,
            0,
          ),
        ),
        sql: measuredFeed.sql,
      },
    };
  } finally {
    await prisma.$disconnect();
    await removeTestDatabase(database);
  }
}
