export type ActivationDraft = {
  username: string;
  password: string;
};

const ACTIVATION_KEY = "flobrain_activation_draft";
const RECOVERY_KEY = "flobrain_recovery_email";
export const REMEMBERED_USERNAME_KEY = "flobrain_remembered_username";

export function saveActivationDraft(draft: ActivationDraft) {
  sessionStorage.setItem(ACTIVATION_KEY, JSON.stringify(draft));
}

export function readActivationDraft(): ActivationDraft | null {
  const raw = sessionStorage.getItem(ACTIVATION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActivationDraft;
    if (!parsed.username || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearActivationDraft() {
  sessionStorage.removeItem(ACTIVATION_KEY);
}

export function saveRecoveryEmail(email: string) {
  sessionStorage.setItem(RECOVERY_KEY, email);
}

export function readRecoveryEmail(): string | null {
  return sessionStorage.getItem(RECOVERY_KEY);
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Member";
  const words = local.replace(/[._-]+/g, " ").trim();
  if (!words) return "Member";
  return words.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
