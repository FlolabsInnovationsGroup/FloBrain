import { describe, expect, it } from "vitest";
import { firstPasswordError, isEmail, passwordScore, strengthMeta } from "./passwordRules";

describe("password rules", () => {
  it("rejects a short password with the designed message", () => {
    expect(firstPasswordError("Ab1!")).toBe("Password must be at least 8 characters long.");
  });

  it("accepts a password that meets every rule", () => {
    expect(firstPasswordError("Password1!")).toBeNull();
    expect(passwordScore("Password1!")).toBe(4);
    expect(strengthMeta(4)).toEqual({ filled: 3, label: "Strong", tone: "strong" });
  });

  it("checks email addresses used by recovery", () => {
    expect(isEmail("sarah@")).toBe(false);
    expect(isEmail("sarah.chen@company.com")).toBe(true);
  });
});
