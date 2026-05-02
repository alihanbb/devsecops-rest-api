const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { env } = require("../config/env");
const { AppError } = require("../utils/app-error");

const AUTH_SCHEME = "Bearer";

const parseAuthHeader = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== AUTH_SCHEME || !token) {
    throw new AppError("Invalid authorization header format", StatusCodes.UNAUTHORIZED);
  }

  return token;
};

const authenticateToken = (req, _res, next) => {
  try {
    const token = parseAuthHeader(req.headers.authorization);
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
      return;
    }
    next(error);
  }
};

const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    next(new AppError("Forbidden: insufficient role", StatusCodes.FORBIDDEN));
    return;
  }
  next();
};

module.exports = { authenticateToken, authorizeRoles };
