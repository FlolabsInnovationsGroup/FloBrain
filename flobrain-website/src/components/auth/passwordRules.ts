export type PasswordRuleId = "length" | "number" | "upper" | "special";

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  message: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    message: "Password must be at least 8 characters long.",
    test: (password) => password.length >= 8,
  },
  {
    id: "number",
    label: "Includes a number",
    message: "Password must include a number.",
    test: (password) => /\d/.test(password),
  },
  {
    id: "upper",
    label: "Includes an uppercase letter",
    message: "Password must include an uppercase letter.",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "special",
    label: "Includes a special character",
    message: "Password must include a special character.",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function passwordScore(password: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

export function firstPasswordError(password: string): string | null {
  return PASSWORD_RULES.find((rule) => !rule.test(password))?.message ?? null;
}

export type StrengthTone = "empty" | "weak" | "fair" | "good" | "strong";

/** Strong matches the Figma meter: three filled segments and a gray remainder. */
export function strengthMeta(score: number): {
  filled: number;
  label: string;
  tone: StrengthTone;
} {
  if (score <= 0) return { filled: 0, label: "", tone: "empty" };
  if (score === 1) return { filled: 1, label: "Weak", tone: "weak" };
  if (score === 2) return { filled: 2, label: "Fair", tone: "fair" };
  if (score === 3) return { filled: 3, label: "Good", tone: "good" };
  return { filled: 3, label: "Strong", tone: "strong" };
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
