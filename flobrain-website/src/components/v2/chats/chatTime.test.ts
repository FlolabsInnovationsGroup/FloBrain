import { describe, expect, it } from "vitest";
import { formatMessageTime } from "./chatTime";

const now = new Date("2026-11-25T12:00:00Z");

describe("formatMessageTime", () => {
  it("shows 'just now' under a minute", () => {
    expect(formatMessageTime("2026-11-25T11:59:30Z", now)).toBe("just now");
  });

  it("shows hours within the same 24 hours", () => {
    expect(formatMessageTime("2026-11-25T11:00:00Z", now)).toBe("1 hour ago");
    expect(formatMessageTime("2026-11-24T13:00:00Z", now)).toBe("23 hours ago");
  });

  it("shows minutes under an hour", () => {
    expect(formatMessageTime("2026-11-25T11:45:00Z", now)).toBe("15 minutes ago");
  });

  it("uses the device date format after 24 hours", () => {
    const sent = new Date("2026-11-23T12:00:00Z");
    expect(formatMessageTime(sent, now)).toBe(sent.toLocaleDateString());
  });
});
