import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

export const QUERY_TRACE_HEADER = "x-postly-query-trace";

function roundMilliseconds(value) {
  return Math.round(value * 1000) / 1000;
}

export function createQueryTrace({
  enabled,
  operationName = null,
  relationStrategy = null,
}) {
  return {
    enabled,
    id: randomUUID(),
    operationName,
    relationStrategy,
    startedAt: new Date().toISOString(),
    nextSequence: 1,
    entries: [],
  };
}

export function instrumentPrismaForRequest(prisma, trace) {
  if (!trace.enabled) return prisma;

  return prisma.$extends({
    name: "postly-request-query-trace",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const sequence = trace.nextSequence++;
          const started = performance.now();
          let outcome = "ok";

          try {
            return await query(args);
          } catch (error) {
            outcome = "error";
            throw error;
          } finally {
            trace.entries.push({
              sequence,
              model,
              operation,
              outcome,
              durationMs: roundMilliseconds(performance.now() - started),
            });
          }
        },
      },
    },
  });
}

export function summarizeQueryTrace(trace) {
  const entries = [...trace.entries].sort(
    (left, right) => left.sequence - right.sequence,
  );

  return {
    traceId: trace.id,
    operationName: trace.operationName,
    relationStrategy: trace.relationStrategy,
    startedAt: trace.startedAt,
    prismaOperationCount: entries.length,
    totalPrismaDurationMs: roundMilliseconds(
      entries.reduce((total, entry) => total + entry.durationMs, 0),
    ),
    operations: entries,
  };
}
