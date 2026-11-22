import { describe, expect, it } from "vitest";
import {
  isLeadershipNavActive,
  isMainNavActive,
  isV2ShellRoute,
  showLeadershipSearch,
} from "./navigation";

describe("V2 navigation active state", () => {
  it("marks the matching primary item and keeps Leadership active on nested routes", () => {
    expect(isMainNavActive("/leadership/dashboard", "/leadership/teams")).toBe(true);
    expect(isMainNavActive("/leadership/dashboard", "/leadership/dashboard")).toBe(true);
    expect(isMainNavActive("/tasks", "/leadership/teams")).toBe(false);
    expect(isMainNavActive("/docs", "/docs")).toBe(true);
    expect(isMainNavActive("/tasks", "/tasks/later")).toBe(true);

  });

  it("selects Dashboard only on /leadership/dashboard", () => {
    expect(isLeadershipNavActive("/leadership/dashboard", "/leadership/dashboard")).toBe(true);
    expect(isLeadershipNavActive("/leadership/dashboard", "/leadership/teams")).toBe(false);
    expect(isLeadershipNavActive("/leadership/teams", "/leadership/teams")).toBe(true);
    expect(isLeadershipNavActive("/leadership/activity", "/leadership/activity")).toBe(true);
  });

  it("shows search only on dashboard, teams, and interns", () => {
    expect(showLeadershipSearch("/leadership/dashboard")).toBe(true);
    expect(showLeadershipSearch("/leadership/teams")).toBe(true);
    expect(showLeadershipSearch("/leadership/interns")).toBe(true);
    expect(showLeadershipSearch("/leadership/projects")).toBe(false);
    expect(showLeadershipSearch("/leadership/tasks")).toBe(false);
    expect(showLeadershipSearch("/docs")).toBe(false);

  });

  it("treats Lead Controls routes as V2 shell pages", () => {
    expect(isV2ShellRoute("/leadership")).toBe(true);
    expect(isV2ShellRoute("/leadership/dashboard")).toBe(true);
    expect(isV2ShellRoute("/leadership/teams")).toBe(true);
    expect(isV2ShellRoute("/leadership/teams/new")).toBe(true);
    expect(isV2ShellRoute("/leadership/projects/new")).toBe(true);
    expect(isV2ShellRoute("/leadership/tasks/new")).toBe(true);
    expect(isV2ShellRoute("/tasks")).toBe(true);

    expect(isV2ShellRoute("/")).toBe(false);
    expect(isV2ShellRoute("/dashboard")).toBe(false);
  });
});

