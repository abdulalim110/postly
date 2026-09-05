import { createDataLoaderStrategy } from "./dataLoader.js";
import { createExplicitBatchingStrategy } from "./explicitBatching.js";
import { createNaiveStrategy } from "./naive.js";
import { createPrismaRelationQueryStrategy } from "./prismaRelationQuery.js";

export const RELATION_STRATEGY_HEADER = "x-postly-relation-strategy";
export const DEFAULT_RELATION_STRATEGY = "dataloader";
export const RELATION_STRATEGY_NAMES = [
  "naive",
  "prisma",
  "batch",
  "dataloader",
];

const factories = {
  naive: createNaiveStrategy,
  prisma: createPrismaRelationQueryStrategy,
  batch: createExplicitBatchingStrategy,
  dataloader: createDataLoaderStrategy,
};

export function normalizeRelationStrategyName(
  value,
  fallback = DEFAULT_RELATION_STRATEGY,
) {
  const name = String(value ?? fallback).trim().toLowerCase();

  if (!RELATION_STRATEGY_NAMES.includes(name)) {
    throw new Error(
      `Unknown relation strategy "${name}". Expected one of: ${RELATION_STRATEGY_NAMES.join(", ")}.`,
    );
  }

  return name;
}

export function createRelationStrategy(name, prisma) {
  const normalizedName = normalizeRelationStrategyName(name);
  return factories[normalizedName](prisma);
}
