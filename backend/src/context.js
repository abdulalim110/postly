import { readAccessToken } from "./auth.js";
import { prisma } from "./db.js";
import {
  createQueryTrace,
  instrumentPrismaForRequest,
  QUERY_TRACE_HEADER,
} from "./instrumentation/queryTrace.js";
import {
  createRelationStrategy,
  DEFAULT_RELATION_STRATEGY,
  normalizeRelationStrategyName,
  RELATION_STRATEGY_HEADER,
} from "./relationStrategies/index.js";

function getAuthorizationHeader(headers) {
  const value = headers?.authorization;
  return Array.isArray(value) ? value[0] : value;
}

function getHeader(headers, name) {
  const value = headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

export function createContext(request) {
  const queryLoggingEnabled = process.env.ENABLE_QUERY_LOG === "true";
  const requestedStrategy = queryLoggingEnabled
    ? getHeader(request.headers, RELATION_STRATEGY_HEADER)
    : null;
  const relationStrategyName = normalizeRelationStrategyName(
    requestedStrategy ?? process.env.RELATION_STRATEGY ?? DEFAULT_RELATION_STRATEGY,
  );
  const queryTrace = createQueryTrace({
    enabled:
      queryLoggingEnabled &&
      getHeader(request.headers, QUERY_TRACE_HEADER) === "true",
    operationName: request.body?.operationName ?? null,
    relationStrategy: relationStrategyName,
  });
  const requestPrisma = instrumentPrismaForRequest(prisma, queryTrace);
  const relations = createRelationStrategy(relationStrategyName, requestPrisma);

  return {
    prisma: requestPrisma,
    auth: readAccessToken(getAuthorizationHeader(request.headers)),
    queryTrace,
    relations,
    relationStrategy: relationStrategyName,
  };
}
