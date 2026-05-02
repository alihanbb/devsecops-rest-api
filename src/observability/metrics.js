const client = require("prom-client");
const { env } = require("../config/env");

const register = new client.Registry();

register.setDefaultLabels({
  app: env.APP_NAME,
  env: env.NODE_ENV,
});

client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

const normalizeRoute = (req) => req.route?.path || req.path || "unknown";

const metricsMiddleware = (req, res, next) => {
  if (!env.METRICS_ENABLED) {
    return next();
  }

  const end = httpRequestDurationMs.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode),
    });
  });

  return next();
};

const metricsHandler = async (_req, res) => {
  const metrics = await register.metrics();
  res.setHeader("Content-Type", register.contentType);
  res.send(metrics);
};

module.exports = {
  metricsMiddleware,
  metricsHandler,
};
