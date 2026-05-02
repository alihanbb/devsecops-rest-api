const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { env } = require("../../config/env");
const { AppError } = require("../../utils/app-error");

const USERS = [
  { id: "user-admin", username: "admin", password: "admin123", role: "admin" },
  { id: "user-reader", username: "reader", password: "reader123", role: "reader" },
];

const login = async ({ username, password }) => {
  const user = USERS.find((entry) => entry.username === username && entry.password === password);
  if (!user) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign(
    {
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      subject: user.id,
    },
  );

  return {
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: env.JWT_EXPIRES_IN,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
};

module.exports = { authService: { login } };
