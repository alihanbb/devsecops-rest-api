const request = require("supertest");
const { StatusCodes } = require("http-status-codes");

const tasks = new Map();

const mockTaskService = {
  async listTasks() {
    return Array.from(tasks.values());
  },
  async getTaskById(id) {
    const task = tasks.get(id);
    if (!task) {
      const err = new Error("Task not found");
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }
    return task;
  },
  async createTask(payload) {
    const id = `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const now = new Date().toISOString();
    const task = {
      id,
      title: payload.title,
      description: payload.description || "",
      completed: payload.completed || false,
      createdAt: now,
      updatedAt: now,
    };
    tasks.set(id, task);
    return task;
  },
  async updateTask(id, payload) {
    const task = await this.getTaskById(id);
    const updatedTask = {
      ...task,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    tasks.set(id, updatedTask);
    return updatedTask;
  },
  async deleteTask(id) {
    await this.getTaskById(id);
    tasks.delete(id);
  },
};

jest.mock("../src/modules/tasks/task.service", () => ({
  taskService: mockTaskService,
}));

const { app } = require("../src/app");

describe("Tasks API", () => {
  const loginAs = async (username, password) => {
    const response = await request(app).post("/api/v1/auth/login").send({ username, password });
    return response.body.data.accessToken;
  };

  const authHeaderFor = async (username, password) => {
    const token = await loginAs(username, password);
    return { Authorization: `Bearer ${token}` };
  };

  afterEach(() => {
    tasks.clear();
  });

  test("GET /health/live returns liveness information", async () => {
    const response = await request(app).get("/health/live");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
    });
  });

  test("GET /metrics returns Prometheus metrics payload", async () => {
    const response = await request(app).get("/metrics");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("http_request_duration_ms");
  });

  test("CRUD flow for /api/v1/tasks", async () => {
    const adminAuthHeader = await authHeaderFor("admin", "admin123");
    const createResponse = await request(app).post("/api/v1/tasks").send({
        title: "Write pipeline",
        description: "Add CI security gates",
      })
      .set(adminAuthHeader);

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.data.title).toBe("Write pipeline");
    const taskId = createResponse.body.data.id;

    const listResponse = await request(app).get("/api/v1/tasks").set(adminAuthHeader);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);

    const updateResponse = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .send({
        completed: true,
      })
      .set(adminAuthHeader);
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.data.completed).toBe(true);

    const deleteResponse = await request(app).delete(`/api/v1/tasks/${taskId}`).set(adminAuthHeader);
    expect(deleteResponse.statusCode).toBe(204);
  });

  test("Validation error returns 400", async () => {
    const adminAuthHeader = await authHeaderFor("admin", "admin123");
    const response = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "",
      })
      .set(adminAuthHeader);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("POST /api/v1/auth/login returns JWT token bundle", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.tokenType).toBe("Bearer");
    expect(response.body.data.user.role).toBe("admin");
    expect(typeof response.body.data.accessToken).toBe("string");
  });

  test("Protected routes reject unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/tasks");
    expect(response.statusCode).toBe(401);
  });

  test("Reader role cannot mutate tasks", async () => {
    const readerAuthHeader = await authHeaderFor("reader", "reader123");
    const response = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "Blocked write",
      })
      .set(readerAuthHeader);

    expect(response.statusCode).toBe(403);
  });
});
