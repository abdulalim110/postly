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
import {
  createRelationStrategy,
  RELATION_STRATEGY_NAMES,
} from "../src/relationStrategies/index.js";
import { schema } from "../src/schema.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "..");
const projectRoot = path.resolve(backendRoot, "..");
const evidenceDirectory = path.join(projectRoot, "output", "diagnostics");
const jsonPath = path.join(evidenceDirectory, "d07-strategy-comparison.json");
const markdownPath = path.join(evidenceDirectory, "d07-strategy-comparison.md");
const operation = print(FEED_QUERY);
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

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

function getResultShape(result) {
  const posts = result.data.feed;
  return {
    posts: posts.length,
    topLevelComments: posts.reduce(
      (total, post) => total + post.comments.length,
      0,
    ),
    replies: posts.reduce(
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
}

async function createSourceManifest() {
  const files = [
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

async function runStrategy(strategyName) {
  const sqlEntries = [];
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
      relationStrategy: strategyName,
    });
    const requestPrisma = instrumentPrismaForRequest(prisma, queryTrace);
    const relations = createRelationStrategy(strategyName, requestPrisma);
    const result = await graphql({
      schema,
      source: operation,
      contextValue: {
        prisma: requestPrisma,
        auth: null,
        queryTrace,
        relations,
        relationStrategy: strategyName,
      },
    });

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const requestTrace = summarizeQueryTrace(queryTrace);
    return {
      strategy: strategyName,
      resultShape: getResultShape(result),
      response: result.data,
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
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyRequestScopedDataLoader(expectedResponse) {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  async function executeRequest() {
    const queryTrace = createQueryTrace({
      enabled: true,
      operationName: "PublicFeed",
      relationStrategy: "dataloader",
    });
    const requestPrisma = instrumentPrismaForRequest(prisma, queryTrace);
    const relations = createRelationStrategy("dataloader", requestPrisma);
    const result = await graphql({
      schema,
      source: operation,
      contextValue: {
        prisma: requestPrisma,
        auth: null,
        queryTrace,
        relations,
        relationStrategy: "dataloader",
      },
    });

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    return {
      response: result.data,
      trace: summarizeQueryTrace(queryTrace),
    };
  }

  try {
    const requests = await Promise.all([executeRequest(), executeRequest()]);
    const traceIds = requests.map(({ trace }) => trace.traceId);
    const prismaOperationCounts = requests.map(
      ({ trace }) => trace.prismaOperationCount,
    );
    const responsesMatchExpected = requests.every(
      ({ response }) => JSON.stringify(response) === expectedResponse,
    );
    const distinctTraceIds = new Set(traceIds).size === requests.length;

    if (!responsesMatchExpected || !distinctTraceIds) {
      throw new Error("Concurrent DataLoader request isolation check failed.");
    }

    return {
      concurrentRequests: requests.length,
      traceIds,
      distinctTraceIds,
      prismaOperationCounts,
      responsesMatchExpected,
    };
  } finally {
    await prisma.$disconnect();
  }
}

function renderMarkdown(evidence) {
  const comparisonRows = evidence.runs
    .map(
      (run) =>
        `| ${run.strategy} | ${run.requestTrace.prismaOperationCount} | ${run.sqlTrace.sqlQueryCount} | ${run.responseMatchesBaseline ? "yes" : "NO"} |`,
    )
    .join("\n");
  const detailSections = evidence.runs
    .map((run) => {
      const operationRows = run.requestTrace.operationSummary
        .map(
          ({ operationName, count }) =>
            `| \`${operationName}\` | ${count} |`,
        )
        .join("\n");
      const sqlSections = run.sqlTrace.queries
        .map(
          (entry) =>
            `#### SQL ${entry.sequence}\n\nDuration: ${entry.durationMs} ms\n\n\`\`\`sql\n${entry.query}\n\`\`\`\n\nParameters: \`${entry.params}\``,
        )
        .join("\n\n");

      return `## ${run.strategy}\n\n- Result shape: ${run.resultShape.posts} posts, ${run.resultShape.topLevelComments} top-level comments, ${run.resultShape.replies} replies\n- Response matches naive baseline: ${run.responseMatchesBaseline ? "yes" : "NO"}\n- Prisma Client operations: ${run.requestTrace.prismaOperationCount}\n- SQL queries emitted: ${run.sqlTrace.sqlQueryCount}\n- Sum of Prisma operation durations: ${run.requestTrace.totalPrismaDurationMs} ms\n- Sum of SQL event durations: ${run.sqlTrace.totalSqlDurationMs} ms\n\nDurations describe this run only and are not a performance claim.\n\n### Prisma operations by model and action\n\n| Operation | Count |\n| --- | ---: |\n${operationRows}\n\n### Actual SQL log\n\n${sqlSections}`;
    })
    .join("\n\n");

  return `# D07 Relation Strategy Comparison\n\nGenerated: ${evidence.generatedAt}\n\nFour implementations executed the exact same frontend GraphQL operation against the same seeded local SQLite database. Counts below were captured from those executions; they were not estimated.\n\n## Measurement boundary\n\n- One dedicated Prisma Client and one isolated strategy instance were used per run.\n- Each run used the same database, operation, field selection, and ordering.\n- The full GraphQL response from each option was compared with the naive response.\n- Prisma Client operation count and SQL query count are separate observations.\n- This tiny local dataset is not used for a latency or production-performance claim.\n\n## GraphQL operation\n\n\`\`\`graphql\n${evidence.graphql.operation}\n\`\`\`\n\n## Comparison\n\n| Strategy | Prisma operations | SQL queries | Same response |\n| --- | ---: | ---: | :---: |\n${comparisonRows}\n\n## Request-scoped DataLoader check\n\nTwo DataLoader GraphQL executions were started concurrently with a new strategy instance and query trace for each request. Both matched the expected response and produced distinct trace IDs. Their observed Prisma operation counts were ${evidence.requestIsolation.prismaOperationCounts.join(" and ")}.\n\n${detailSections}\n`;
}

await fs.mkdir(evidenceDirectory, { recursive: true });

const runs = [];
for (const strategyName of RELATION_STRATEGY_NAMES) {
  runs.push(await runStrategy(strategyName));
}

const baselineResponse = JSON.stringify(runs[0].response);
const requestIsolation = await verifyRequestScopedDataLoader(baselineResponse);
for (const run of runs) {
  run.responseMatchesBaseline = JSON.stringify(run.response) === baselineResponse;
  delete run.response;
}

if (runs.some((run) => !run.responseMatchesBaseline)) {
  throw new Error("At least one relation strategy changed the GraphQL response.");
}

const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scenario: "D07 relation-loading strategy comparison",
  database: "seeded local SQLite",
  graphql: {
    operationName: "PublicFeed",
    operation,
  },
  strategyOrder: RELATION_STRATEGY_NAMES,
  sourceManifest: await createSourceManifest(),
  requestIsolation,
  runs,
};

await fs.writeFile(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
await fs.writeFile(markdownPath, renderMarkdown(evidence));

console.log(
  JSON.stringify(
    {
      jsonPath,
      markdownPath,
      comparison: runs.map((run) => ({
        strategy: run.strategy,
        resultShape: run.resultShape,
        responseMatchesBaseline: run.responseMatchesBaseline,
        prismaOperationCount: run.requestTrace.prismaOperationCount,
        sqlQueryCount: run.sqlTrace.sqlQueryCount,
      })),
      requestIsolation,
    },
    null,
    2,
  ),
);
