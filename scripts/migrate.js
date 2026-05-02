const fs = require("fs/promises");
const path = require("path");
const { initDb, query, closeDb } = require("../src/db/postgres");
const { logger } = require("../src/config/logger");

const migrationsDir = path.resolve(__dirname, "../db/migrations");

const runMigrations = async () => {
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  for (const sqlFile of sqlFiles) {
    const migrationPath = path.join(migrationsDir, sqlFile);
    const sql = await fs.readFile(migrationPath, "utf-8");
    logger.info({ sqlFile }, "Applying SQL migration");
    await query(sql);
  }
};

const bootstrap = async () => {
  await initDb();
  await runMigrations();
  logger.info("Database migrations completed");
};

void bootstrap()
  .catch((err) => {
    logger.error({ err }, "Database migration failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
