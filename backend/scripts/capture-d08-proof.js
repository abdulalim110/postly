import "dotenv/config";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { print } from "graphql";
import { FEED_QUERY } from "../../frontend/src/graphql.js";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { runBehaviorSuite } from "../tests/support/behaviorSuite.js";
import {
  backendRoot,
  provisionTestDatabase,
  removeTestDatabase,
} from "../tests/support/testDatabase.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, "../..");
const evidenceDirectory = path.join(projectRoot, "output", "diagnostics");
const jsonPath = path.join(evidenceDirectory, "d08-proof.json");
const markdownPath = path.join(evidenceDirectory, "d08-proof.md");
const diffPath = path.join(
  evidenceDirectory,
  "d08-naive-to-dataloader.diff",
);
const tsxCliPath = fileURLToPath(import.meta.resolve("tsx/cli"));

const HTTP_OPERATIONS = {
  login: `
    mutation D08RehearsalLogin($identifier: String!, $password: String!) {
      login(identifier: $identifier, password: $password) {
        token
        user { id username }
      }
    }
  `,
  createPost: `
    mutation D08RehearsalPost($caption: String!, $imageKey: String!) {
      createPost(caption: $caption, imageKey: $imageKey) { id caption imageKey }
    }
  `,
  createComment: `
    mutation D08RehearsalComment($postId: ID!, $parentId: ID, $content: String!) {
      createComment(postId: $postId, parentId: $parentId, content: $content) {
        id postId parentId content
      }
    }
  `,
  profile: `
    query D08RehearsalProfile($username: String!) {
      user(username: $username) {
        username
        posts { id caption imageKey }
      }
    }
  `,
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function findOpenPort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.equal(typeof address, "object");
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForHealth(baseUrl, serverProcess) {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
      throw new Error(
        `Rehearsal server exited with ${serverProcess.exitCode ?? serverProcess.signalCode}.`,
      );
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return response.json();
    } catch {
      // The process may still be binding its local port.
    }

    await delay(100);
  }

  throw new Error("Timed out while waiting for the rehearsal server.");
}

async function stopServer(serverProcess) {
  if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
    return;
  }

  const exitPromise = once(serverProcess, "exit");
  serverProcess.kill();
  await Promise.race([exitPromise, delay(3_000)]);

  if (serverProcess.exitCode === null && serverProcess.signalCode === null) {
    serverProcess.kill("SIGKILL");
    await once(serverProcess, "exit");
  }
}

async function postGraphql(baseUrl, {
  source,
  operationName,
  variables = {},
  token = null,
  trace = false,
}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (trace) headers["x-postly-query-trace"] = "true";

  const response = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: source, operationName, variables }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.errors, undefined);
  assert.ok(body.data);
  return body;
}

async function getDatabaseCounts(databaseUrl) {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    return {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function runHttpRehearsal() {
  const database = await provisionTestDatabase("http-rehearsal");
  const port = await findOpenPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const stdout = [];
  const stderr = [];
  const serverProcess = spawn(process.execPath, [tsxCliPath, "src/index.js"], {
    cwd: backendRoot,
    env: {
      ...process.env,
      DATABASE_URL: database.databaseUrl,
      ENABLE_QUERY_LOG: "true",
      JWT_SECRET: "postly-d08-rehearsal-secret-at-least-32-characters",
      PORT: String(port),
      RELATION_STRATEGY: "dataloader",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  serverProcess.stdout.on("data", (chunk) => stdout.push(chunk.toString()));
  serverProcess.stderr.on("data", (chunk) => stderr.push(chunk.toString()));

  try {
    const cleanSeedCounts = await getDatabaseCounts(database.databaseUrl);
    assert.deepEqual(cleanSeedCounts, { users: 4, posts: 8, comments: 22 });

    const health = await waitForHealth(baseUrl, serverProcess);
    assert.equal(health.status, "ok");

    const loginBody = await postGraphql(baseUrl, {
      source: HTTP_OPERATIONS.login,
      operationName: "D08RehearsalLogin",
      variables: {
        identifier: "alex.morgan",
        password: "PostlyDemo123!",
      },
    });
    const token = loginBody.data.login.token;

    const measuredFeed = await postGraphql(baseUrl, {
      source: print(FEED_QUERY),
      operationName: "PublicFeed",
      trace: true,
    });
    assert.equal(measuredFeed.data.feed.length, 8);
    assert.equal(measuredFeed.extensions.queryTrace.relationStrategy, "dataloader");

    const postBody = await postGraphql(baseUrl, {
      source: HTTP_OPERATIONS.createPost,
      operationName: "D08RehearsalPost",
      variables: {
        caption: "D08 clean database rehearsal",
        imageKey: "workspace",
      },
      token,
    });
    const postId = postBody.data.createPost.id;

    const commentBody = await postGraphql(baseUrl, {
      source: HTTP_OPERATIONS.createComment,
      operationName: "D08RehearsalComment",
      variables: {
        postId,
        parentId: null,
        content: "Rehearsal top-level comment",
      },
      token,
    });
    const commentId = commentBody.data.createComment.id;
    assert.equal(commentBody.data.createComment.parentId, null);

    const replyBody = await postGraphql(baseUrl, {
      source: HTTP_OPERATIONS.createComment,
      operationName: "D08RehearsalComment",
      variables: {
        postId,
        parentId: commentId,
        content: "Rehearsal reply",
      },
      token,
    });
    assert.equal(replyBody.data.createComment.parentId, commentId);

    const profileBody = await postGraphql(baseUrl, {
      source: HTTP_OPERATIONS.profile,
      operationName: "D08RehearsalProfile",
      variables: { username: "alex.morgan" },
    });
    assert.equal(
      profileBody.data.user.posts.some((post) => post.id === postId),
      true,
    );

    const finalFeed = await postGraphql(baseUrl, {
      source: print(FEED_QUERY),
      operationName: "PublicFeed",
    });
    const rehearsedPost = finalFeed.data.feed.find((post) => post.id === postId);
    assert.ok(rehearsedPost);
    assert.equal(rehearsedPost.comments[0].id, commentId);
    assert.equal(rehearsedPost.comments[0].replies[0].parentId, commentId);

    await stopServer(serverProcess);
    const finalCounts = await getDatabaseCounts(database.databaseUrl);
    assert.deepEqual(finalCounts, { users: 4, posts: 9, comments: 24 });

    return {
      passed: true,
      strategy: "dataloader",
      cleanSeedCounts,
      finalCounts,
      measuredFeed: {
        posts: measuredFeed.data.feed.length,
        prismaOperationCount:
          measuredFeed.extensions.queryTrace.prismaOperationCount,
        traceId: measuredFeed.extensions.queryTrace.traceId,
      },
      checks: [
        "migration deployed to an empty SQLite file",
        "repeatable seed restored 4 users, 8 posts, and 22 comments/replies",
        "Apollo/Express health endpoint responded",
        "seed account logged in through HTTP GraphQL",
        "public feed used the configured DataLoader strategy",
        "authenticated post creation succeeded",
        "top-level comment and exact parentId reply succeeded",
        "public profile and final nested feed contained rehearsal records",
      ],
      serverOutput: `${stdout.join("")}${stderr.join("")}`.trim(),
      databaseRemovedAfterRun: true,
    };
  } finally {
    await stopServer(serverProcess);
    await removeTestDatabase(database);
  }
}

async function createDiffReview() {
  const sourcePaths = [
    "src/context.js",
    "src/resolvers/Query.js",
    "src/resolvers/Post.js",
    "src/resolvers/Comment.js",
    "src/resolvers/User.js",
    "src/relationStrategies/index.js",
    "src/relationStrategies/naive.js",
    "src/relationStrategies/prismaRelationQuery.js",
    "src/relationStrategies/explicitBatching.js",
    "src/relationStrategies/dataLoader.js",
    "src/relationStrategies/batchQueries.js",
    "src/relationStrategies/manualBatchLoader.js",
  ];
  const sourceText = (
    await Promise.all(
      sourcePaths.map((relativePath) =>
        fs.readFile(path.join(backendRoot, relativePath), "utf8"),
      ),
    )
  ).join("\n");
  const forbiddenFeatureTerms = [
    ...sourceText.matchAll(
      /\b(like|follow|story|chat|notification|upload)\b/gi,
    ),
  ].map((match) => match[0].toLowerCase());
  assert.deepEqual(forbiddenFeatureTerms, []);

  const schemaText = await fs.readFile(
    path.join(backendRoot, "prisma/schema.prisma"),
    "utf8",
  );
  const domainModels = [...schemaText.matchAll(/^model\s+(\w+)/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(domainModels, ["User", "Post", "Comment"]);

  const diff = spawnSync(
    "git",
    [
      "diff",
      "--no-index",
      "--",
      "src/relationStrategies/naive.js",
      "src/relationStrategies/dataLoader.js",
    ],
    { cwd: backendRoot, encoding: "utf8", windowsHide: true },
  );
  if (diff.error) throw diff.error;
  if (![0, 1].includes(diff.status)) {
    throw new Error(diff.stderr || "Unable to generate no-index diff.");
  }

  await fs.writeFile(diffPath, diff.stdout);
  return {
    reviewMethod:
      "git diff --no-index between the preserved naive and selected DataLoader strategy; the project has no Git metadata",
    diffFile: "output/diagnostics/d08-naive-to-dataloader.diff",
    diffLines: diff.stdout.split(/\r?\n/).length - 1,
    reviewedSourcePaths: sourcePaths.map((sourcePath) =>
      `backend/${sourcePath}`,
    ),
    forbiddenFeatureTerms,
    domainModels,
    graphqlOperationSharedByBothStrategies: true,
  };
}

function renderMarkdown(evidence) {
  const runRows = evidence.runs
    .map(
      (run) =>
        `| ${run.strategy} | ${run.checks.length}/${run.checks.length} | ${run.queryEvidence.prismaOperationCount} | ${run.queryEvidence.sqlQueryCount} | pass |`,
    )
    .join("\n");
  const checkRows = evidence.runs[0].checks
    .map((check, index) => `| ${index + 1} | ${check} | pass | pass |`)
    .join("\n");
  const rehearsalChecks = evidence.rehearsal.checks
    .map((check) => `- ${check}`)
    .join("\n");

  return `# D08 Proof and Clean-Database Rehearsal\n\nGenerated: ${evidence.generatedAt}\n\n## Outcome\n\nThe exact same behavior suite passed on the preserved naive baseline and the selected request-scoped DataLoader fix. The suite provisioned a new SQLite file, deployed migrations, seeded it, executed the checks, and removed it after each run.\n\n| Strategy | Behavior checks | Prisma operations | SQL queries | Result |\n| --- | ---: | ---: | ---: | :---: |\n${runRows}\n\nThe counts above came from the same frontend \`PublicFeed\` operation on the same clean seed shape: 8 posts, 16 top-level comments, and 6 replies. Durations and counts describe these local runs only; they are not a general performance claim.\n\n## Same behavior checks\n\n| # | Check | naive | dataloader |\n| ---: | --- | :---: | :---: |\n${checkRows}\n\nBehavior signatures match: ${evidence.sameBehaviorSignature ? "yes" : "NO"}.\n\n## Clean-database HTTP rehearsal\n\n${rehearsalChecks}\n\nThe HTTP rehearsal started Apollo Server and Express against another newly migrated and seeded SQLite file. It ended with ${evidence.rehearsal.finalCounts.users} users, ${evidence.rehearsal.finalCounts.posts} posts, and ${evidence.rehearsal.finalCounts.comments} comments/replies, then removed the disposable database. The measured clean feed used ${evidence.rehearsal.strategy} and recorded ${evidence.rehearsal.measuredFeed.prismaOperationCount} Prisma operations.\n\n## Diff and scope review\n\n- Review method: ${evidence.diffReview.reviewMethod}.\n- Saved patch: \`${evidence.diffReview.diffFile}\`.\n- Prisma domain models: ${evidence.diffReview.domainModels.join(", ")}.\n- Forbidden feature terms in the reviewed relation-loading source: none.\n- Baseline and fix executed the same GraphQL schema and operation.\n\n## Reproduce\n\n\`\`\`powershell\nnpm test\nnpm run prove:d08\nnpm run build\n\`\`\`\n`;
}

await fs.mkdir(evidenceDirectory, { recursive: true });

const runs = [];
for (const strategyName of ["naive", "dataloader"]) {
  runs.push(await runBehaviorSuite(strategyName));
}

assert.deepEqual(runs[0].behaviorSignature, runs[1].behaviorSignature);
assert.ok(
  runs[1].queryEvidence.sqlQueryCount < runs[0].queryEvidence.sqlQueryCount,
);

const rehearsal = await runHttpRehearsal();
const diffReview = await createDiffReview();
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scenario: "D08 baseline-versus-fix behavior proof and rehearsal",
  sameBehaviorSignature: true,
  runs,
  rehearsal,
  diffReview,
};

await fs.writeFile(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
await fs.writeFile(markdownPath, renderMarkdown(evidence));

console.log(
  JSON.stringify(
    {
      jsonPath,
      markdownPath,
      diffPath,
      comparison: runs.map((run) => ({
        strategy: run.strategy,
        behaviorChecksPassed: run.checks.length,
        prismaOperationCount: run.queryEvidence.prismaOperationCount,
        sqlQueryCount: run.queryEvidence.sqlQueryCount,
      })),
      sameBehaviorSignature: true,
      rehearsal: {
        passed: rehearsal.passed,
        checksPassed: rehearsal.checks.length,
        cleanSeedCounts: rehearsal.cleanSeedCounts,
        finalCounts: rehearsal.finalCounts,
      },
    },
    null,
    2,
  ),
);
