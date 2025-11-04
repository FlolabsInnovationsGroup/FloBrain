const { z } = require("zod");

const TodoCreateSchema = z.object({
  title: z.string().min(1, "title is required"),
  done: z.boolean().default(false),
});

const TodoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a numeric string"),
});

module.exports = { TodoCreateSchema, TodoIdParamSchema };
