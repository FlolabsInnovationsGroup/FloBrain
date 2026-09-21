import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { apiClient } from "./axios";

function unauthorized(
  config: InternalAxiosRequestConfig,
  data: { error: string; details?: unknown }
) {
  return Promise.reject(
    new AxiosError(
      "Request failed with status code 401",
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      {
        status: 401,
        statusText: "Unauthorized",
        data,
        headers: {},
        config,
      }
    )
  );
}

describe("apiClient 401 interceptor", () => {
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    localStorage.clear();
  });

  it("keeps the original sign-in 401 instead of treating it as a refresh failure", async () => {
    apiClient.defaults.adapter = async (config) =>
      unauthorized(config, {
        error: "Invalid credentials",
        details: { non_field_errors: ["Invalid credentials"] },
      });

    const err = await apiClient
      .post("/api/auth/signin/", { email: "a@b.c", password: "x" })
      .then(
        () => {
          throw new Error("expected 401");
        },
        (reason: unknown) => reason
      );

    expect(err).toBeInstanceOf(AxiosError);
    expect(err).toMatchObject({
      response: {
        status: 401,
        data: { error: "Invalid credentials" },
      },
    });
    expect(err).not.toMatchObject({ message: "No refresh token" });
  });

  it("does not swallow a protected-route 401 when no refresh token exists", async () => {
    apiClient.defaults.adapter = async (config) =>
      unauthorized(config, {
        error: "Authentication required",
        details: "Valid Bearer token required",
      });

    const err = await apiClient.get("/api/profile/").then(
      () => {
        throw new Error("expected 401");
      },
      (reason: unknown) => reason
    );

    expect(err).toMatchObject({
      response: {
        status: 401,
        data: { error: "Authentication required" },
      },
    });
  });
});

describe("api.signIn through the interceptor", () => {
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    localStorage.clear();
  });

  it("surfaces Invalid credentials instead of Couldn't connect to FloBrain", async () => {
    const { api } = await import("./api");

    apiClient.defaults.adapter = async (config) =>
      unauthorized(config, {
        error: "Invalid credentials",
        details: { non_field_errors: ["Invalid credentials"] },
      });

    const result = await api.signIn("env-probe@example.com", "WrongPassword123!");

    expect(result.status).toBe(401);
    expect(result.error).toMatch(/Invalid credentials/);
    expect(result.error).not.toBe("Couldn't connect to FloBrain");
  });
});
