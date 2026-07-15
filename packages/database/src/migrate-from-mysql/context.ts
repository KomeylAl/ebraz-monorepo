import type { PrismaClient } from "@prisma/client";
import type { Connection } from "mysql2/promise";
import { IdMap } from "./id-map";

export interface MigrationOptions {
  dryRun: boolean;
  skipExisting: boolean;
  verbose: boolean;
}

export interface MigrationContext {
  prisma: PrismaClient;
  mysql: Connection;
  idMap: IdMap;
  options: MigrationOptions;
  stats: Record<string, number>;
}

export function createContext(
  prisma: PrismaClient,
  mysql: Connection,
  options: MigrationOptions,
): MigrationContext {
  return {
    prisma,
    mysql,
    idMap: new IdMap(),
    options,
    stats: {},
  };
}

export function bumpStat(ctx: MigrationContext, key: string, count = 1): void {
  ctx.stats[key] = (ctx.stats[key] ?? 0) + count;
}

export function log(ctx: MigrationContext, message: string): void {
  if (ctx.options.verbose) {
    console.log(message);
  }
}
