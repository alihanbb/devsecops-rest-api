const { StatusCodes } = require("http-status-codes");
const { env } = require("../config/env");
const { logger } = require("../config/logger");

const notFoundHandler = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = StatusCodes.NOT_FOUND;
  next(err);
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const response = {
    message: err.message || "Internal server error",
  };

  if (err.details) {
    response.details = err.details;
  }

  if (env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
      requestId: req.id,
      statusCode,
    },
    "Request failed",
  );

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
