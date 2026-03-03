"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Trash2, Pencil, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const inputClass =
  "w-full px-4 py-3 bg-[#281C30] border border-zinc-500/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400/70";

export default function ProfileSettings() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const openEditModal = () => {
    setFormData({
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
    });
    setSaveStatus("idle");
    setSaveError(null);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSaveStatus("idle");
    setSaveError(null);
  };

  const handleModalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveStatus("idle");
    setSaveError(null);
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSaveStatus("saving");
    setSaveError(null);
    const res = await api.updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });
    if (res.error || !res.data) {
      setSaveStatus("error");
      setSaveError(res.error ?? "Failed to save profile");
      return;
    }
    setSaveStatus("saved");
    setProfile({ fullName: res.data.fullName, email: res.data.email });
    setTimeout(() => closeEditModal(), 800);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.warn("Deleting account...");
    }
  };

  const currentPlan = { name: "Developer", price: "Free" };

  if (isLoading) {
    return (
      <div className="text-white/80 text-sm">Loading profile…</div>
    );
  }

  if (loadError && isAuthenticated) {
    return (
      <div className="space-y-4">
        <p className="text-red-400 text-sm">{loadError}</p>
        <button
          type="button"
          onClick={fetchProfile}
          className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <p className="text-amber-400/90 text-sm">Sign in to view and edit your profile.</p>
      )}

      {/* Name and email with Edit on the right */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-zinc-400 text-sm">Full Name</p>
          <p className="text-white font-medium truncate">
            {profile?.fullName || "—"}
          </p>
          <p className="text-zinc-400 text-sm mt-3">Email Address</p>
          <p className="text-white truncate">
            {profile?.email || "—"}
          </p>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={openEditModal}
            className="flex items-center gap-2 shrink-0 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Edit profile modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="bg-[#1a1525] border border-zinc-500/50 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-profile-title" className="text-xl font-semibold text-white">
                Edit profile
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal-fullName" className="block text-white text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="modal-fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleModalChange}
                  placeholder="John Doe"
                  className={inputClass}
                  disabled={saveStatus === "saving"}
                />
              </div>
              <div>
                <label htmlFor="modal-email" className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="modal-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleModalChange}
                  placeholder="john.doe@example.com"
                  className={inputClass}
                  disabled={saveStatus === "saving"}
                />
              </div>

              {saveError && (
                <p className="text-red-400 text-sm" role="alert">
                  {saveError}
                </p>
              )}
              {saveStatus === "saved" && (
                <p className="text-green-400 text-sm" role="status">
                  Saved.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white font-medium rounded-lg text-sm transition-colors"
                  disabled={saveStatus === "saving"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  {saveStatus === "saving" ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <label className="block text-white text-sm font-medium mb-2">Current Plan</label>
        <div className="px-4 py-3 bg-[#281C30] border border-zinc-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{currentPlan.name}</span>
            <span className="text-white">{currentPlan.price}</span>
          </div>
          <div className="mt-1 text-right">
            <Link
              href="/pricing"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Contact Us</label>
        <button
          type="button"
          className={`${inputClass} w-full text-left cursor-pointer hover:border-zinc-400/60 transition-colors`}
        >
          Contact Us
        </button>
      </div>

      <button
        type="button"
        onClick={handleDeleteAccount}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#E07A5F] hover:bg-[#d96b4f] text-white font-medium rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
        Delete Account
      </button>
    </div>
  );
}
