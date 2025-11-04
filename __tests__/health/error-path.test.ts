import request from "supertest";
import app from "../../src/media-app";

it("500 global error handler works", async () => {
  const res = await request(app).get("/__test__/crash").expect(500);
  expect(res.body).toEqual({ error: "Internal Server Error" });
});
