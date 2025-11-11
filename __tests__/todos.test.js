const request = require("supertest");
const app = require("../src/app");
const { TodoCreateSchema, TodoIdParamSchema } = require("../src/schemas/todo.schema");

describe("Todos API + Zod validation", () => {
  it("201 creates a todo with valid body", async () => {
    const valid = TodoCreateSchema.parse({ title: "Buy milk", done: false }); // reuse schema
    const res = await request(app).post("/todos").send(valid).expect(201);
    expect(res.body).toMatchObject({ title: "Buy milk", done: false });
    // id shape
    expect(() => TodoIdParamSchema.parse({ id: res.body.id })).not.toThrow();
  });

  it("400 rejects invalid body (empty title)", async () => {
    const res = await request(app).post("/todos").send({ title: "" }).expect(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.title?.length).toBeGreaterThan(0);
  });

  it("200 fetches existing todo", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Read paper", done: true })
      .expect(201);
    const res = await request(app).get(`/todos/${created.body.id}`).expect(200);
    expect(res.body).toMatchObject({ id: created.body.id, title: "Read paper", done: true });
  });

  it("404 when todo not found", async () => {
    await request(app).get("/todos/99999").expect(404);
  });

  it("400 for invalid id format", async () => {
    await request(app).get("/todos/abc").expect(400);
  });
});
