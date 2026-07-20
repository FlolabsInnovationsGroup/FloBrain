"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

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
    return <p className="fb-profile-body text-sm">Loading profile…</p>;
  }

  if (loadError && isAuthenticated) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-500" role="alert">
          {loadError}
        </p>
        <button
          type="button"
          onClick={fetchProfile}
          className="fb-profile-btn-secondary rounded-xl px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isAuthenticated && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "var(--fb-profile-field-bg)",
            borderColor: "var(--fb-profile-field-border)",
            color: "var(--fb-profile-warning)",
          }}
        >
          <Link href="/signin" className="font-medium underline" style={{ color: "var(--fb-profile-link)" }}>
            Sign in
          </Link>{" "}
          to view and edit your profile.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <p className="fb-profile-label mb-1 text-sm">Full Name</p>
            <p className="fb-profile-title truncate font-medium">
              {profile?.fullName || "—"}
            </p>
          </div>
          <div>
            <p className="fb-profile-label mb-1 text-sm">Email Address</p>
            <p className="fb-profile-title truncate">{profile?.email || "—"}</p>
          </div>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={openEditModal}
            className="fb-profile-btn-primary flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "var(--fb-profile-modal-overlay)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="fb-profile-modal w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 id="edit-profile-title" className="fb-profile-title text-lg font-semibold">
                Edit profile
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="fb-profile-btn-secondary rounded-lg p-1.5 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal-fullName" className="fb-profile-label mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="modal-fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleModalChange}
                  placeholder="John Doe"
                  className={`fb-profile-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea]/40 ${fieldErrors.fullName ? "border-red-400" : ""}`}
                  disabled={saveStatus === "saving"}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="modal-email" className="fb-profile-label mb-2 block text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="modal-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleModalChange}
                  placeholder="john.doe@example.com"
                  className={`fb-profile-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea]/40 ${fieldErrors.email ? "border-red-400" : ""}`}
                  disabled={saveStatus === "saving"}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              {saveError && (
                <p className="text-sm text-red-500" role="alert">
                  {saveError}
                </p>
              )}
              {saveStatus === "saved" && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                  Saved.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="fb-profile-btn-secondary flex-1 rounded-xl px-4 py-2.5 text-sm font-medium"
                  disabled={saveStatus === "saving"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="fb-profile-btn-primary flex-1 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {saveStatus === "saving" ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <p className="fb-profile-label mb-2 text-sm font-medium">Current Plan</p>
        <div className="fb-profile-card rounded-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="fb-profile-title font-semibold">{currentPlan.name}</span>
            <span className="fb-profile-title">{currentPlan.price}</span>
          </div>
          <div className="mt-2 text-right">
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--fb-profile-link)" }}
            >
              Upgrade now →
            </Link>
          </div>
        </div>
      </div>

      <div>
        <p className="fb-profile-label mb-2 text-sm font-medium">Support</p>
        <Link
          href="/contact"
          className="fb-profile-card flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:opacity-90"
          style={{ color: "var(--fb-profile-title)" }}
        >
          Contact us
          <span style={{ color: "var(--fb-profile-link)" }}>→</span>
        </Link>
      </div>

      <div className="fb-profile-divider border-t pt-6">
        <p className="fb-profile-label mb-3 text-sm">Danger zone</p>
        <button
          type="button"
          onClick={openDeleteModal}
          className="fb-profile-btn-danger flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      </div>

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "var(--fb-profile-modal-overlay)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="fb-profile-modal w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 id="delete-account-title" className="fb-profile-title text-lg font-semibold">
                Delete account
              </h3>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="fb-profile-btn-secondary rounded-lg p-1.5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="fb-profile-body mb-4 text-sm">
              This action cannot be undone. All your data will be permanently removed. Enter your
              password to confirm.
            </p>
            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="delete-account-password"
                  className="fb-profile-label mb-2 block text-sm font-medium"
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
                  className="fb-profile-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  autoComplete="current-password"
                  disabled={deleteStatus === "deleting"}
                />
              </div>
              {deleteError && (
                <p className="text-sm text-red-500" role="alert">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="fb-profile-btn-secondary flex-1 rounded-xl px-4 py-2.5 text-sm font-medium"
                  disabled={deleteStatus === "deleting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteStatus === "deleting"}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "var(--fb-profile-danger)" }}
                >
                  {deleteStatus === "deleting" ? "Deleting…" : "Delete account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
