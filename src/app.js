const express = require("express");
const { TodoCreateSchema, TodoIdParamSchema } = require("./schemas/todo.schema");
const { validate } = require("./utils/validate");

const app = express();
app.use(express.json());

// in-memory store for demo/tests
const store = new Map();
let nextId = 1;

app.get("/health", (_, res) => res.json({ ok: true }));

// POST /todos -> create
app.post("/todos", (req, res, next) => {
  try {
    const body = validate(TodoCreateSchema, req.body);
    const id = String(nextId++);
    const todo = { id, ...body };
    store.set(id, todo);
    res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
});

// GET /todos/:id -> read
app.get("/todos/:id", (req, res, next) => {
  try {
    const params = validate(TodoIdParamSchema, req.params);
    const todo = store.get(params.id);
    if (!todo) return res.status(404).json({ error: "Not found" });
    res.json(todo);
  } catch (e) {
    next(e);
  }
});

// simple error handler for validation
app.use((err, _req, res, _next) => {
  if (err && err.status === 400) {
    return res.status(400).json(err.payload || { error: "Bad Request" });
  }
  // fallback
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
