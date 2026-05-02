const express = require("express");
const { validateRequest } = require("../../middlewares/validate-request");
const { asyncHandler } = require("../../middlewares/async-handler");
const { authenticateToken, authorizeRoles } = require("../../middlewares/auth");
const { createTaskSchema, updateTaskSchema } = require("./task.schema");
const { listTasks, getTask, createTask, updateTask, deleteTask } = require("./task.controller");

const taskRouter = express.Router();

taskRouter.use(authenticateToken);
taskRouter.get("/", authorizeRoles("admin", "reader"), asyncHandler(listTasks));
taskRouter.get("/:id", authorizeRoles("admin", "reader"), asyncHandler(getTask));
taskRouter.post("/", authorizeRoles("admin"), validateRequest(createTaskSchema), asyncHandler(createTask));
taskRouter.patch("/:id", authorizeRoles("admin"), validateRequest(updateTaskSchema), asyncHandler(updateTask));
taskRouter.delete("/:id", authorizeRoles("admin"), asyncHandler(deleteTask));

module.exports = { taskRouter };
