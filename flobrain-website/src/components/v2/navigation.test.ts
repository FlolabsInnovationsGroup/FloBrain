import { describe, expect, it } from "vitest";
import { isLeadershipNavActive, isMainNavActive } from "./navigation";

describe("V2 navigation active state", () => {
  it("marks the matching primary item and keeps Leadership active on nested routes", () => {
    expect(isMainNavActive("/leadership", "/leadership/teams")).toBe(true);
    expect(isMainNavActive("/my-tasks", "/leadership/teams")).toBe(false);
    expect(isMainNavActive("/my-docs", "/my-docs")).toBe(true);
    expect(isMainNavActive("/my-tasks", "/my-tasks/later")).toBe(true);
  });

  it("selects Dashboard only on the leadership index", () => {
    expect(isLeadershipNavActive("/leadership", "/leadership")).toBe(true);
    expect(isLeadershipNavActive("/leadership", "/leadership/teams")).toBe(false);
    expect(isLeadershipNavActive("/leadership/teams", "/leadership/teams")).toBe(true);
    expect(isLeadershipNavActive("/leadership/activity", "/leadership/activity")).toBe(true);
  });
});
