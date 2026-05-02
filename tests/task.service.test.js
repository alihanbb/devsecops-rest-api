const { TaskService } = require("../src/modules/tasks/task.service");

describe("TaskService", () => {
  const createRepository = () => {
    const tasks = new Map();
    let sequence = 0;

    return {
      async list() {
        return Array.from(tasks.values());
      },
      async findById(id) {
        return tasks.get(id) || null;
      },
      async create(payload) {
        const now = new Date().toISOString();
        sequence += 1;
        const task = {
          id: `task-${sequence}`,
          title: payload.title,
          description: payload.description || "",
          completed: payload.completed || false,
          createdAt: now,
          updatedAt: now,
        };
        tasks.set(task.id, task);
        return task;
      },
      async update(id, payload) {
        const updated = {
          ...payload,
          id,
          updatedAt: new Date().toISOString(),
        };
        tasks.set(id, updated);
        return updated;
      },
      async delete(id) {
        tasks.delete(id);
      },
    };
  };

  test("creates and gets a task", async () => {
    const taskService = new TaskService(createRepository());
    const created = await taskService.createTask({ title: "Task title" });
    const fetched = await taskService.getTaskById(created.id);

    expect(fetched.id).toBe(created.id);
    expect(fetched.title).toBe("Task title");
    expect(fetched.completed).toBe(false);
  });

  test("updates an existing task", async () => {
    const taskService = new TaskService(createRepository());
    const created = await taskService.createTask({ title: "Initial" });
    const updated = await taskService.updateTask(created.id, { title: "Updated", completed: true });

    expect(updated.title).toBe("Updated");
    expect(updated.completed).toBe(true);
    expect(Date.parse(updated.updatedAt)).toBeGreaterThanOrEqual(Date.parse(created.updatedAt));
  });
});
