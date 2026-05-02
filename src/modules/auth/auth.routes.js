const express = require("express");
const { validateRequest } = require("../../middlewares/validate-request");
const { asyncHandler } = require("../../middlewares/async-handler");
const { authService } = require("./auth.service");
const { loginSchema } = require("./auth.schema");

const authRouter = express.Router();

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const tokenBundle = await authService.login(req.body);
    res.status(200).json({ data: tokenBundle });
  }),
);

module.exports = { authRouter };
