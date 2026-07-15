import mysql from "mysql2/promise";
import { prisma } from "../client";
import { createContext, type MigrationOptions } from "./context";
import { MIGRATION_STEPS } from "./steps";

export interface RunMigrationOptions extends MigrationOptions {
  mysqlUrl: string;
}

export async function runMysqlMigration(options: RunMigrationOptions): Promise<Record<string, number>> {
  const connection = await mysql.createConnection(options.mysqlUrl);

  try {
    const ctx = createContext(prisma, connection, options);

    console.log(
      options.dryRun
        ? "MySQL → PostgreSQL migration (DRY RUN — no writes)"
        : "MySQL → PostgreSQL migration",
    );

    for (const step of MIGRATION_STEPS) {
      console.log(`→ ${step.name}`);
      await step.run(ctx);
    }

    console.log("\nMigration summary:");
    for (const [key, value] of Object.entries(ctx.stats).sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  ${key}: ${value}`);
    }

    if (options.dryRun) {
      console.log("\nDry run complete. Re-run without --dry-run to apply changes.");
    } else {
      console.log("\nMigration complete.");
    }

    return ctx.stats;
  } finally {
    await connection.end();
    await prisma.$disconnect();
  }
}
