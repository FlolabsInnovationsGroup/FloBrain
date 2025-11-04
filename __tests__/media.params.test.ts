import request from "supertest";
import app from "../src/media-app";

it("GET /media/:id -> 200 with numeric id", async () => {
  const res = await request(app).get("/media/123").expect(200);
  expect(res.body).toEqual({ ok: true, id: "123" });
});

it("GET /media/:id -> 400 for bad id", async () => {
  const res = await request(app).get("/media/abc").expect(400);
  expect(res.body.code).toBe("VALIDATION_PARAMS");
});

it("GET /media?limit=10 -> 200", async () => {
  const res = await request(app).get("/media?limit=10").expect(200);
  expect(res.body).toEqual({ ok: true, limit: 10 });
});

it("GET /media?limit=9999 -> 400", async () => {
  const res = await request(app).get("/media?limit=9999").expect(400);
  expect(res.body.code).toBe("VALIDATION_QUERY");
});
