const { StatusCodes } = require("http-status-codes");
const { taskService } = require("./task.service");

const listTasks = async (_req, res) => {
  const tasks = await taskService.listTasks();
  res.status(StatusCodes.OK).json({ data: tasks });
};

const getTask = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(StatusCodes.OK).json({ data: task });
};

const createTask = async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(StatusCodes.CREATED).json({ data: task });
};

const updateTask = async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.status(StatusCodes.OK).json({ data: task });
};

const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
