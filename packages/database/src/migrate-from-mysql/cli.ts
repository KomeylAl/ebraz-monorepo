import { runMysqlMigration } from "./run";

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run"),
    skipExisting: !argv.includes("--force-update"),
    verbose: argv.includes("--verbose"),
  };
}

async function main() {
  const mysqlUrl = process.env.MYSQL_DATABASE_URL;
  if (!mysqlUrl) {
    console.error("MYSQL_DATABASE_URL is required.");
    console.error("Example: mysql://root:password@localhost:3306/ebraz_clinic");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));

  try {
    await runMysqlMigration({
      mysqlUrl,
      dryRun: args.dryRun,
      skipExisting: args.skipExisting,
      verbose: args.verbose,
    });
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
