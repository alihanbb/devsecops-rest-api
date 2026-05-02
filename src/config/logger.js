const pino = require("pino");
const { env } = require("./env");

const logger = pino({
  name: env.APP_NAME,
  level: env.LOG_LEVEL,
  base: {
    service: env.APP_NAME,
    version: env.APP_VERSION,
    env: env.NODE_ENV,
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[REDACTED]",
  },
});

module.exports = { logger };
