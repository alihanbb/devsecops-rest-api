const { Pool } = require("pg");
const { env } = require("../config/env");
const { logger } = require("../config/logger");

let pool;

const createPool = () =>
  new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
  });

const initDb = async () => {
  if (pool) {
    return;
  }

  pool = createPool();
  await pool.query("SELECT 1");
  logger.info(
    {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      poolMax: env.DB_POOL_MAX,
    },
    "PostgreSQL connection pool initialized",
  );
};

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error("Database pool is not initialized");
  }

  return pool.query(text, params);
};

const closeDb = async () => {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
  logger.info("PostgreSQL connection pool closed");
};

module.exports = {
  initDb,
  query,
  closeDb,
};
