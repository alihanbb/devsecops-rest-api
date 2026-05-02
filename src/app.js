const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const swaggerUi = require("swagger-ui-express");
const { env } = require("./config/env");
const { logger } = require("./config/logger");
const { healthRouter } = require("./routes/health.routes");
const { v1Router } = require("./routes/v1");
const { notFoundHandler, errorHandler } = require("./middlewares/error-handler");
const { metricsMiddleware, metricsHandler } = require("./observability/metrics");
const { openApiSpec } = require("./docs/openapi");

const app = express();

app.locals.isReady = true;

app.set("trust proxy", env.TRUST_PROXY);

app.use(
  pinoHttp({
    logger,
    customLogLevel(_req, res, err) {
      if (res.statusCode >= 500 || err) {
        return "error";
      }
      if (res.statusCode >= 400) {
        return "warn";
      }
      return "info";
    },
  }),
);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((item) => item.trim()),
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(metricsMiddleware);

app.use("/health", healthRouter);
app.get("/metrics", metricsHandler);
app.get("/docs/openapi.json", (_req, res) => {
  res.status(200).json(openApiSpec);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api/v1", v1Router);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
