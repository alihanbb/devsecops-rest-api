const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../../utils/app-error");
const { TaskRepository } = require("./task.repository");

class TaskService {
  constructor(taskRepository = new TaskRepository()) {
    this.taskRepository = taskRepository;
  }

  async listTasks() {
    return this.taskRepository.list();
  }

  async getTaskById(id) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }
    return task;
  }

  async createTask(payload) {
    return this.taskRepository.create(payload);
  }

  async updateTask(id, payload) {
    const existingTask = await this.getTaskById(id);
    const nextTask = {
      ...existingTask,
      ...payload,
    };

    const updatedTask = await this.taskRepository.update(id, nextTask);
    if (!updatedTask) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }
    return updatedTask;
  }

  async deleteTask(id) {
    await this.getTaskById(id);
    await this.taskRepository.delete(id);
  }
}

const taskService = new TaskService();

module.exports = { TaskService, taskService };
