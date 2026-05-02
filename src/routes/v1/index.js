const express = require("express");
const { authRouter } = require("../../modules/auth/auth.routes");
const { taskRouter } = require("../../modules/tasks/task.routes");

const v1Router = express.Router();

v1Router.use("/auth", authRouter);
v1Router.use("/tasks", taskRouter);

module.exports = { v1Router };
