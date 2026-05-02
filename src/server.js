const { env } = require("./config/env");
const { logger } = require("./config/logger");
const { startTracing, shutdownTracing } = require("./observability/tracing");
const { initDb, closeDb } = require("./db/postgres");

let server;
let app;

const shutdown = async (signal) => {
  logger.warn({ signal }, "Graceful shutdown started");
  if (app) {
    app.locals.isReady = false;
  }

  if (!server) {
    await Promise.allSettled([closeDb(), shutdownTracing()]);
    process.exit(0);
  }

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timeout reached, forcing exit");
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close(async (err) => {
    try {
      if (err) {
        logger.error({ err }, "Error while closing HTTP server");
        process.exit(1);
      }

      await Promise.allSettled([closeDb(), shutdownTracing()]);
      logger.info("HTTP server closed");
      process.exit(0);
    } catch (shutdownError) {
      logger.error({ err: shutdownError }, "Error while stopping observability");
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

const bootstrap = async () => {
  await initDb();
  await startTracing();
  ({ app } = require("./app"));

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server started");
  });
};

void bootstrap().catch((err) => {
  logger.error({ err }, "Application bootstrap failed");
  process.exit(1);
});

module.exports = { bootstrap };
