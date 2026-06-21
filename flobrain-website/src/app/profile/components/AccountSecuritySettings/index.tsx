"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

const inputClass =
  "w-full px-4 py-3 bg-[#281C30] border border-zinc-500/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400/70";

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
      const msg = res.details && typeof res.details === "object" && "current_password" in res.details
        ? (res.details.current_password as string[])?.[0] ?? res.error
        : res.error;
      setErrorMessage(msg);
      setStatus("error");
      return;
    }
    setStatus("success");
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">Password</h3>
        <p className="text-zinc-400 text-sm mb-3">
          Change your password to keep your account secure.
        </p>
        <button
          type="button"
          onClick={openModal}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-colors"
        >
          Change password
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
        >
          <div className="bg-[#1a1525] border border-zinc-500/50 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="change-password-title" className="text-xl font-semibold text-white">
                Change password
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label htmlFor="modal-currentPassword" className="block text-white text-sm font-medium mb-2">
                  Current password
                </label>
                <input
                  id="modal-currentPassword"
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={inputClass}
                  autoComplete="current-password"
                  disabled={status === "submitting"}
                />
              </div>
              <div>
                <label htmlFor="modal-newPassword" className="block text-white text-sm font-medium mb-2">
                  New password
                </label>
                <input
                  id="modal-newPassword"
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 8 characters)"
                  className={inputClass}
                  autoComplete="new-password"
                  disabled={status === "submitting"}
                />
              </div>
              <div>
                <label htmlFor="modal-confirmPassword" className="block text-white text-sm font-medium mb-2">
                  Confirm new password
                </label>
                <input
                  id="modal-confirmPassword"
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={inputClass}
                  autoComplete="new-password"
                  disabled={status === "submitting"}
                />
              </div>

              {errorMessage && (
                <p className="text-red-400 text-sm" role="alert">
                  {errorMessage}
                </p>
              )}
              {status === "success" && (
                <p className="text-green-400 text-sm" role="status">
                  Password updated successfully.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white font-medium rounded-lg text-sm transition-colors"
                  disabled={status === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  {status === "submitting" ? "Updating…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-500/30 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Two-Factor Authentication (2FA)</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              twoFactorEnabled ? "bg-green-500" : "bg-gray-600"
            }`}
            aria-label="Toggle two-factor authentication"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                twoFactorEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
