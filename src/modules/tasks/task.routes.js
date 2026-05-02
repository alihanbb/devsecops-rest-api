const express = require("express");
const { validateRequest } = require("../../middlewares/validate-request");
const { asyncHandler } = require("../../middlewares/async-handler");
const { createTaskSchema, updateTaskSchema } = require("./task.schema");
const { listTasks, getTask, createTask, updateTask, deleteTask } = require("./task.controller");

const taskRouter = express.Router();

taskRouter.get("/", asyncHandler(listTasks));
taskRouter.get("/:id", asyncHandler(getTask));
taskRouter.post("/", validateRequest(createTaskSchema), asyncHandler(createTask));
taskRouter.patch("/:id", validateRequest(updateTaskSchema), asyncHandler(updateTask));
taskRouter.delete("/:id", asyncHandler(deleteTask));

module.exports = { taskRouter };
