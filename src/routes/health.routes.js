const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { env } = require("../config/env");

const healthRouter = express.Router();

healthRouter.get("/live", (_req, res) => {
  res.status(StatusCodes.OK).json({
    status: "ok",
    service: env.APP_NAME,
    version: env.APP_VERSION,
    uptime: process.uptime(),
  });
});

healthRouter.get("/ready", (req, res) => {
  if (!req.app.locals.isReady) {
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      status: "degraded",
      service: env.APP_NAME,
      version: env.APP_VERSION,
    });
  }

  return res.status(StatusCodes.OK).json({
    status: "ready",
    service: env.APP_NAME,
    version: env.APP_VERSION,
  });
});

module.exports = { healthRouter };
