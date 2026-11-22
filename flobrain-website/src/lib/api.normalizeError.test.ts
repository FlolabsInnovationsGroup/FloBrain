import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./axios";
import { api } from "./api";

vi.mock("./axios", () => ({
  apiClient: {
    request: vi.fn(),
  },
  getApiBaseUrl: () => "http://test.local",
}));

const mockRequest = vi.mocked(apiClient.request);

describe("api.request error normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns FloBrain connect message for network/unreachable failures", async () => {
    mockRequest.mockRejectedValue({
      message: "Network Error",
      response: undefined,
    });

    const result = await api.getDashboardHealth();

    expect(result.error).toBe("Couldn't connect to FloBrain");
    expect(result.status).toBe(0);
    expect(result.details).toBe("Network Error");
  });

  it("preserves a meaningful backend-provided error message", async () => {
    mockRequest.mockRejectedValue({
      message: "Request failed with status code 503",
      response: {
        status: 503,
        data: { error: "Dashboard service is unavailable" },
      },
    });

    const result = await api.getDashboardHealth();

    expect(result.error).toBe("Dashboard service is unavailable");
    expect(result.status).toBe(503);
  });

  it("falls back when the response has no usable backend error message", async () => {
    mockRequest.mockRejectedValue({
      message: "Request failed with status code 500",
      response: {
        status: 500,
        data: {},
      },
    });

    const result = await api.getDashboardHealth();

    expect(result.error).toBe("Couldn't connect to FloBrain");
    expect(result.status).toBe(500);
  });
});
