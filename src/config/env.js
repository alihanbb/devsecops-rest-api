const dotenv = require("dotenv");
const { cleanEnv, num, port, str, bool } = require("envalid");

dotenv.config();

const runtimeEnv = process.env.NODE_ENV || "development";
const defaultLogLevel = runtimeEnv === "test" ? "silent" : "info";

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "test", "production"], default: "development" }),
  APP_NAME: str({ default: "devsecops-rest-api" }),
  APP_VERSION: str({ default: "1.0.0" }),
  PORT: port({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    default: defaultLogLevel,
  }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }),
  RATE_LIMIT_MAX: num({ default: 100 }),
  CORS_ORIGIN: str({ default: "http://localhost:3000" }),
  TRUST_PROXY: bool({ default: false }),
  SHUTDOWN_TIMEOUT_MS: num({ default: 10000 }),
  METRICS_ENABLED: bool({ default: true }),
  OTEL_ENABLED: bool({ default: true }),
  OTEL_EXPORTER_OTLP_ENDPOINT: str({ default: "http://tempo:4318/v1/traces" }),
  DB_HOST: str({ default: "localhost" }),
  DB_PORT: port({ default: 5432 }),
  DB_NAME: str({ default: "devsecops" }),
  DB_USER: str({ default: "postgres" }),
  DB_PASSWORD: str({ default: "postgres" }),
  DB_SSL: bool({ default: false }),
  DB_POOL_MAX: num({ default: 10 }),
  DB_IDLE_TIMEOUT_MS: num({ default: 10000 }),
  DB_CONNECTION_TIMEOUT_MS: num({ default: 5000 }),
  JWT_SECRET: str({ default: "change-me-in-production" }),
  JWT_EXPIRES_IN: str({ default: "1h" }),
});

module.exports = { env };
