"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { SettingsNestedModal } from "../SettingsNestedModal";
import {
  settingsBtnDestructive,
  settingsBtnPrimary,
  settingsBtnSecondary,
  settingsCardClass,
  settingsInputClass,
  settingsTextLabel,
  settingsTextMuted,
} from "../settings-styles";
import { cn } from "@/lib/utils";

export default function ProfileSettings() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setLoadError(null);
    setIsLoading(true);
    const res = await api.getProfile();
    setIsLoading(false);
    if (res.error || !res.data) {
      setLoadError(res.error ?? "Failed to load profile");
      return;
    }
    const data = {
      fullName: res.data.fullName ?? "",
      email: res.data.email ?? "",
    };
    setProfile(data);
    setFormData(data);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadError(null);
      setIsLoading(true);
      const res = await api.getProfile();
      if (cancelled) return;
      setIsLoading(false);
      if (res.error || !res.data) {
        setLoadError(res.error ?? "Failed to load profile");
        return;
      }
      const data = {
        fullName: res.data.fullName ?? "",
        email: res.data.email ?? "",
      };
      setProfile(data);
      setFormData(data);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function parseFieldErrors(details: unknown): Record<string, string> {
    if (!details || typeof details !== "object" || Array.isArray(details)) return {};
    const out: Record<string, string> = {};
    const obj = details as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      const msg = Array.isArray(val) ? val.join(" ") : String(val);
      if (key === "username") out.fullName = msg;
      else if (key === "email" || key === "fullName") out[key] = msg;
    }
    return out;
  }

  const openEditModal = () => {
    setFormData({
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
    });
    setSaveStatus("idle");
    setSaveError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSaveStatus("idle");
    setSaveError(null);
    setFieldErrors({});
  };

  const handleModalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveStatus("idle");
    setSaveError(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[e.target.name];
      return next;
    });
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSaveStatus("saving");
    setSaveError(null);
    setFieldErrors({});
    const res = await api.updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });
    if (res.error || !res.data) {
      setSaveStatus("error");
      setSaveError(res.error ?? "Failed to save profile");
      setFieldErrors(parseFieldErrors(res.details));
      return;
    }
    setSaveStatus("saved");
    setProfile({ fullName: res.data.fullName, email: res.data.email });
    setTimeout(() => closeEditModal(), 800);
  };

  const openDeleteModal = () => {
    setDeletePassword("");
    setDeleteStatus("idle");
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteStatus("idle");
    setDeleteError(null);
  };

  const handleDeleteAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      setDeleteError("Enter your password to confirm.");
      setDeleteStatus("error");
      return;
    }
    setDeleteStatus("deleting");
    setDeleteError(null);
    const res = await api.deleteAccount(deletePassword);
    if (res.error) {
      const msg =
        res.details && typeof res.details === "object" && "password" in res.details
          ? (res.details.password as string[])?.[0] ?? res.error
          : res.error;
      setDeleteError(msg);
      setDeleteStatus("error");
      return;
    }
    await logout();
    closeDeleteModal();
    router.push("/");
  };

  const currentPlan = { name: "Developer", price: "Free" };

  if (isLoading) {
    return <div className={settingsTextMuted}>Loading profile…</div>;
  }

  if (loadError && isAuthenticated) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400" role="alert">
          {loadError}
        </p>
        <button type="button" onClick={fetchProfile} className={settingsBtnSecondary}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isAuthenticated && (
        <p className="text-sm text-amber-400/90">Sign in to view and edit your profile.</p>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={settingsTextMuted}>Full Name</p>
          <p className="truncate font-medium text-white">{profile?.fullName || "—"}</p>
          <p className={cn(settingsTextMuted, "mt-3")}>Email Address</p>
          <p className="truncate text-white">{profile?.email || "—"}</p>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={openEditModal}
            className={cn("flex shrink-0 items-center gap-2", settingsBtnPrimary)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      <SettingsNestedModal
        open={modalOpen}
        onClose={closeEditModal}
        title="Edit profile"
        titleId="edit-profile-title"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-fullName" className={cn(settingsTextLabel, "mb-2 block")}>
              Full Name
            </label>
            <input
              id="modal-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleModalChange}
              placeholder="John Doe"
              className={cn(settingsInputClass, fieldErrors.fullName && "border-red-400/70")}
              disabled={saveStatus === "saving"}
              aria-invalid={!!fieldErrors.fullName}
              aria-describedby={fieldErrors.fullName ? "modal-fullName-error" : undefined}
            />
            {fieldErrors.fullName && (
              <p id="modal-fullName-error" className="mt-1 text-sm text-red-400" role="alert">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="modal-email" className={cn(settingsTextLabel, "mb-2 block")}>
              Email Address
            </label>
            <input
              id="modal-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleModalChange}
              placeholder="john.doe@example.com"
              className={cn(settingsInputClass, fieldErrors.email && "border-red-400/70")}
              disabled={saveStatus === "saving"}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "modal-email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="modal-email-error" className="mt-1 text-sm text-red-400" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {saveError && (
            <p className="text-sm text-red-400" role="alert">
              {saveError}
            </p>
          )}
          {saveStatus === "saved" && (
            <p className="text-sm text-green-400" role="status">
              Saved.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditModal}
              className={cn("flex-1", settingsBtnSecondary)}
              disabled={saveStatus === "saving"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveStatus === "saving"}
              className={cn("flex-1", settingsBtnPrimary)}
            >
              {saveStatus === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </SettingsNestedModal>

      <div>
        <label className={cn(settingsTextLabel, "mb-2 block")}>Current Plan</label>
        <div className={settingsCardClass}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{currentPlan.name}</span>
            <span className="text-white">{currentPlan.price}</span>
          </div>
          <div className="mt-2 text-right">
            <Link
              href="/pricing"
              className="text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              Upgrade now →
            </Link>
          </div>
        </div>
      </div>

      <div>
        <label className={cn(settingsTextLabel, "mb-2 block")}>Contact Us</label>
        <button
          type="button"
          className={cn(
            settingsInputClass,
            "w-full cursor-pointer text-left transition-colors hover:border-white/20"
          )}
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      </div>

      <button
        type="button"
        onClick={openDeleteModal}
        className={cn("flex w-full items-center justify-center gap-2 px-6 py-3", settingsBtnDestructive)}
      >
        <Trash2 className="h-5 w-5" />
        Delete Account
      </button>

      <SettingsNestedModal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete account"
        titleId="delete-account-title"
      >
        <p className={cn(settingsTextMuted, "mb-4")}>
          This action cannot be undone. All your data will be permanently removed. Enter your
          password to confirm.
        </p>
        <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="delete-account-password"
              className={cn(settingsTextLabel, "mb-2 block")}
            >
              Password
            </label>
            <input
              id="delete-account-password"
              type="password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError(null);
              }}
              placeholder="Enter your password"
              className={settingsInputClass}
              autoComplete="current-password"
              disabled={deleteStatus === "deleting"}
            />
          </div>
          {deleteError && (
            <p className="text-sm text-red-400" role="alert">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              className={cn("flex-1", settingsBtnSecondary)}
              disabled={deleteStatus === "deleting"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteStatus === "deleting"}
              className={cn("flex-1", settingsBtnDestructive)}
            >
              {deleteStatus === "deleting" ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </SettingsNestedModal>
    </div>
  );
}
