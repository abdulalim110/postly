import "dotenv/config";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { graphql, print } from "graphql";
import { FEED_QUERY } from "../../frontend/src/graphql.js";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import {
  createQueryTrace,
  instrumentPrismaForRequest,
  summarizeQueryTrace,
} from "../src/instrumentation/queryTrace.js";
import { createRelationStrategy } from "../src/relationStrategies/index.js";
import { schema } from "../src/schema.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "..");
const projectRoot = path.resolve(backendRoot, "..");
const evidenceDirectory = path.join(projectRoot, "output", "diagnostics");
const jsonPath = path.join(evidenceDirectory, "d06-baseline-feed.json");
const markdownPath = path.join(evidenceDirectory, "d06-baseline-feed.md");
const operation = print(FEED_QUERY);
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const sqlEntries = [];

function roundMilliseconds(value) {
  return Math.round(value * 1000) / 1000;
}

function countByOperation(entries) {
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

async function createResolverManifest() {
  const files = [
    "src/resolvers/Query.js",
    "src/resolvers/Post.js",
    "src/resolvers/Comment.js",
    "src/resolvers/User.js",
  ];

  return Promise.all(
    files.map(async (relativePath) => {
      const content = await fs.readFile(path.join(backendRoot, relativePath));
      return {
        path: `backend/${relativePath.replaceAll("\\", "/")}`,
        sha256: createHash("sha256").update(content).digest("hex"),
      };
    }),
  );
}

function renderMarkdown(evidence) {
  const operationRows = evidence.requestTrace.operationSummary
    .map(({ operationName, count }) => `| \`${operationName}\` | ${count} |`)
    .join("\n");
  const resolverRows = evidence.resolverBaseline
    .map(({ path: resolverPath, sha256 }) => `| \`${resolverPath}\` | \`${sha256}\` |`)
    .join("\n");
  const sqlSections = evidence.sqlTrace.queries
    .map(
      (entry) => `### SQL ${entry.sequence}\n\nDuration: ${entry.durationMs} ms\n\n\`\`\`sql\n${entry.query}\n\`\`\`\n\nParameters: \`${entry.params}\``,
    )
    .join("\n\n");

  return `# D06 Baseline Feed Evidence

Generated: ${evidence.generatedAt}

This file is generated from one real GraphQL execution against the seeded local
SQLite database. Do not edit the observed counts manually.

## Measurement boundary

- Relation resolvers remain in the naive baseline implementation.
- One dedicated Prisma Client and one GraphQL operation were used, with no
  concurrent request in the evidence process.
- Prisma operation count and SQL query count are recorded separately because
  Prisma can batch compatible client operations internally.

## GraphQL operation

\`\`\`graphql
${evidence.graphql.operation}
\`\`\`

## Observed result shape

- Posts: ${evidence.resultShape.posts}
- Top-level comments: ${evidence.resultShape.topLevelComments}
- Replies: ${evidence.resultShape.replies}

## Observed counts

- Prisma Client operations: ${evidence.requestTrace.prismaOperationCount}
- SQL queries emitted: ${evidence.sqlTrace.sqlQueryCount}
- Sum of Prisma operation durations: ${evidence.requestTrace.totalPrismaDurationMs} ms
- Sum of SQL event durations: ${evidence.sqlTrace.totalSqlDurationMs} ms

Durations describe this run only and are not a performance claim.

## Prisma operations by model and action

| Operation | Count |
| --- | ---: |
${operationRows}

## Preserved resolver baseline

| Source | SHA-256 |
| --- | --- |
${resolverRows}

## Actual SQL log

${sqlSections}
`;
}

await fs.mkdir(evidenceDirectory, { recursive: true });

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
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
    target: event.target,
  });
});

try {
  const queryTrace = createQueryTrace({
    enabled: true,
    operationName: "PublicFeed",
    relationStrategy: "naive",
  });
  const requestPrisma = instrumentPrismaForRequest(prisma, queryTrace);
  const relations = createRelationStrategy("naive", requestPrisma);
  const result = await graphql({
    schema,
    source: operation,
    contextValue: {
      prisma: requestPrisma,
      auth: null,
      queryTrace,
      relations,
      relationStrategy: "naive",
    },
  });

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }

  const posts = result.data.feed;
  const topLevelComments = posts.reduce(
    (total, post) => total + post.comments.length,
    0,
  );
  const replies = posts.reduce(
    (total, post) =>
      total +
      post.comments.reduce(
        (commentTotal, comment) => commentTotal + comment.replies.length,
        0,
      ),
    0,
  );
  const requestTrace = summarizeQueryTrace(queryTrace);
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scenario: "D06 naive relation resolver baseline",
    database: "seeded local SQLite",
    graphql: {
      operationName: "PublicFeed",
      operation,
    },
    resultShape: {
      posts: posts.length,
      topLevelComments,
      replies,
    },
    resolverBaseline: await createResolverManifest(),
    requestTrace: {
      ...requestTrace,
      operationSummary: countByOperation(requestTrace.operations),
    },
    sqlTrace: {
      sqlQueryCount: sqlEntries.length,
      totalSqlDurationMs: roundMilliseconds(
        sqlEntries.reduce((total, entry) => total + entry.durationMs, 0),
      ),
      queries: sqlEntries,
    },
  };

  await fs.writeFile(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderMarkdown(evidence));
  console.log(
    JSON.stringify(
      {
        jsonPath,
        markdownPath,
        resultShape: evidence.resultShape,
        prismaOperationCount: evidence.requestTrace.prismaOperationCount,
        sqlQueryCount: evidence.sqlTrace.sqlQueryCount,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
