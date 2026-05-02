const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  completed: z.boolean().optional(),
});

const updateTaskSchema = createTaskSchema.partial().refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field must be provided",
});

module.exports = { createTaskSchema, updateTaskSchema };
