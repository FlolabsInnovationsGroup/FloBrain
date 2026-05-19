"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

export default function AccountSecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus("idle");
    setErrorMessage(null);
  };

  const openModal = () => {
    setModalOpen(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setStatus("idle");
    setErrorMessage(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setStatus("idle");
    setErrorMessage(null);
  };

  const handleSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwords.new.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setErrorMessage("New password and confirmation do not match.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);
    const res = await api.changePassword(passwords.current, passwords.new);
    if (res.error) {
      const msg =
        res.details && typeof res.details === "object" && "current_password" in res.details
          ? (res.details.current_password as string[])?.[0] ?? res.error
          : res.error;
      setErrorMessage(msg);
      setStatus("error");
      return;
    }
    setStatus("success");
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => closeModal(), 1200);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="fb-profile-title mb-2 text-lg font-semibold">Password</h3>
        <p className="fb-profile-body mb-4 text-sm">
          Change your password to keep your account secure.
        </p>
        <button
          type="button"
          onClick={openModal}
          className="fb-profile-btn-primary rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Change password
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "var(--fb-profile-modal-overlay)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
        >
          <div className="fb-profile-modal w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 id="change-password-title" className="fb-profile-title text-lg font-semibold">
                Change password
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="fb-profile-btn-secondary rounded-lg p-1.5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              {(["current", "new", "confirm"] as const).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={`modal-${field}`}
                    className="fb-profile-label mb-2 block text-sm font-medium capitalize"
                  >
                    {field === "current"
                      ? "Current password"
                      : field === "new"
                        ? "New password"
                        : "Confirm new password"}
                  </label>
                  <input
                    id={`modal-${field}`}
                    type="password"
                    name={field}
                    value={passwords[field]}
                    onChange={handlePasswordChange}
                    placeholder={
                      field === "new"
                        ? "Min 8 characters"
                        : field === "confirm"
                          ? "Confirm new password"
                          : "Enter current password"
                    }
                    className="fb-profile-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea]/40"
                    autoComplete={
                      field === "current" ? "current-password" : "new-password"
                    }
                    disabled={status === "submitting"}
                  />
                </div>
              ))}
              {errorMessage && (
                <p className="text-sm text-red-500" role="alert">
                  {errorMessage}
                </p>
              )}
              {status === "success" && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                  Password updated successfully.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="fb-profile-btn-secondary flex-1 rounded-xl px-4 py-2.5 text-sm font-medium"
                  disabled={status === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="fb-profile-btn-primary flex-1 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {status === "submitting" ? "Updating…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fb-profile-divider border-t pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="fb-profile-title text-lg font-semibold">
              Two-Factor Authentication
            </h3>
            <p className="fb-profile-body mt-1 text-sm">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              twoFactorEnabled ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
            }`}
            aria-label="Toggle two-factor authentication"
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
