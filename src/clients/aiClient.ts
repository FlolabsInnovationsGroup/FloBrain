export type AiMode = "success" | "timeout" | "http_error";

export async function callAi(_payload: unknown) {
  const mode = (process.env.AI_TEST_MODE as AiMode) || "success";
  const timeoutMs = Number(process.env.AI_JOB_TIMEOUT_MS || 200);

  if (process.env.NODE_ENV === "test") {
    if (mode === "timeout") {
      await new Promise((r) => setTimeout(r, timeoutMs + 50));
      return { status: "timeout" as const };
    }

    if (mode === "http_error") {
      const err: any = new Error("AI service error");
      err.status = 500;
      throw err;
    }

    // Default: success
    return { status: "ok" as const, result: { id: "ai_mock_1" } };
  }

  // TODO: replace with real API call in production
  return { status: "ok" as const, result: { id: "ai_real_1" } };
}
