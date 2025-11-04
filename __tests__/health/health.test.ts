import request from "supertest";
import app from "../../src/media-app";

it("GET /health -> 200", async () => {
  const res = await request(app).get("/health").expect(200);
  expect(res.body).toEqual({ ok: true });
});
