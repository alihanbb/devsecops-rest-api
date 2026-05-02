const { env } = require("../config/env");

const taskSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", maxLength: 120 },
    description: { type: "string", maxLength: 500 },
    completed: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "title", "description", "completed", "createdAt", "updatedAt"],
};

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: `${env.APP_NAME} API`,
    version: env.APP_VERSION,
    description: "DevSecOps REST API endpoint dokumantasyonu",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AuthLoginPayload: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, maxLength: 50 },
          password: { type: "string", minLength: 6, maxLength: 100 },
        },
        required: ["username", "password"],
      },
      AuthTokenResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          tokenType: { type: "string", example: "Bearer" },
          expiresIn: { type: "string", example: "1h" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
              role: { type: "string", enum: ["admin", "reader"] },
            },
            required: ["id", "username", "role"],
          },
        },
        required: ["accessToken", "tokenType", "expiresIn", "user"],
      },
      Task: taskSchema,
      TaskCreatePayload: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120 },
          description: { type: "string", maxLength: 500 },
          completed: { type: "boolean" },
        },
        required: ["title"],
      },
      TaskUpdatePayload: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120 },
          description: { type: "string", maxLength: 500 },
          completed: { type: "boolean" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  },
  paths: {
    "/health/live": {
      get: {
        tags: ["health"],
        summary: "Liveness kontrolu",
        responses: {
          200: {
            description: "Servis ayakta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string" },
                    version: { type: "string" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["health"],
        summary: "Readiness kontrolu",
        responses: {
          200: {
            description: "Servis istek almaya hazir",
          },
          503: {
            description: "Servis kapanis veya degrade durumda",
          },
        },
      },
    },
    "/metrics": {
      get: {
        tags: ["observability"],
        summary: "Prometheus metrikleri",
        responses: {
          200: {
            description: "text/plain metrik payload",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["auth"],
        summary: "JWT token al",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLoginPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Basarili login",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/AuthTokenResponse" },
                  },
                },
              },
            },
          },
          401: {
            description: "Gecersiz kimlik bilgileri",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        tags: ["tasks"],
        summary: "Task listesi",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Task listesi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["tasks"],
        summary: "Task olustur",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskCreatePayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Task olusturuldu",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation hatasi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks/{id}": {
      get: {
        tags: ["tasks"],
        summary: "Task detayi",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Task bulundu",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          404: {
            description: "Task bulunamadi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["tasks"],
        summary: "Task guncelle",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdatePayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Task guncellendi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          404: {
            description: "Task bulunamadi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["tasks"],
        summary: "Task sil",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: {
            description: "Task silindi",
          },
          404: {
            description: "Task bulunamadi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
