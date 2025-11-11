import { callAi } from "../../src/clients/aiClient";

it("AI success mode", async () => {
  process.env.AI_TEST_MODE = "success";
  const r = await callAi({ x: 1 });
  expect(r.status).toBe("ok");
  expect(r).toHaveProperty("result.id");
});

it("AI timeout mode", async () => {
  process.env.AI_TEST_MODE = "timeout";
  process.env.AI_JOB_TIMEOUT_MS = "10";
  const r = await callAi({ x: 1 });
  expect(r.status).toBe("timeout");
});

it("AI http_error mode", async () => {
  process.env.AI_TEST_MODE = "http_error";
  await expect(callAi({ x: 1 })).rejects.toHaveProperty("status", 500);
});
