"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/lib/api";
import { SettingsNestedModal } from "../SettingsNestedModal";
import {
  settingsBtnPrimary,
  settingsBtnSecondary,
  settingsInputClass,
  settingsTextLabel,
  settingsTextMuted,
} from "../settings-styles";
import { cn } from "@/lib/utils";

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
          ? ((res.details.current_password as string[])?.[0] ?? res.error)
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
        <h3 className="mb-2 text-lg font-semibold text-white">Password</h3>
        <p className={cn(settingsTextMuted, "mb-3")}>
          Change your password to keep your account secure.
        </p>
        <button type="button" onClick={openModal} className={settingsBtnPrimary}>
          Change password
        </button>
      </div>

      <SettingsNestedModal
        open={modalOpen}
        onClose={closeModal}
        title="Change password"
        titleId="change-password-title"
      >
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <div>
            <label htmlFor="modal-currentPassword" className={cn(settingsTextLabel, "mb-2 block")}>
              Current password
            </label>
            <input
              id="modal-currentPassword"
              type="password"
              name="current"
              value={passwords.current}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              className={settingsInputClass}
              autoComplete="current-password"
              disabled={status === "submitting"}
            />
          </div>
          <div>
            <label htmlFor="modal-newPassword" className={cn(settingsTextLabel, "mb-2 block")}>
              New password
            </label>
            <input
              id="modal-newPassword"
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 8 characters)"
              className={settingsInputClass}
              autoComplete="new-password"
              disabled={status === "submitting"}
            />
          </div>
          <div>
            <label htmlFor="modal-confirmPassword" className={cn(settingsTextLabel, "mb-2 block")}>
              Confirm new password
            </label>
            <input
              id="modal-confirmPassword"
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className={settingsInputClass}
              autoComplete="new-password"
              disabled={status === "submitting"}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400" role="alert">
              {errorMessage}
            </p>
          )}
          {status === "success" && (
            <p className="text-sm text-green-400" role="status">
              Password updated successfully.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className={cn("flex-1", settingsBtnSecondary)}
              disabled={status === "submitting"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className={cn("flex-1", settingsBtnPrimary)}
            >
              {status === "submitting" ? "Updating…" : "Confirm"}
            </button>
          </div>
        </form>
      </SettingsNestedModal>

      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication (2FA)</h3>
            <p className={cn(settingsTextMuted, "mt-1")}>
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            role="switch"
            aria-checked={twoFactorEnabled}
            className={cn(
              "relative inline-flex h-8 w-14 items-center rounded-full p-0.5 transition-colors",
              twoFactorEnabled ? "bg-violet-500" : "bg-white/20"
            )}
            aria-label="Toggle two-factor authentication"
          >
            <span
              className={cn(
                "h-6 w-6 rounded-full bg-white transition-transform duration-200",
                twoFactorEnabled ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
