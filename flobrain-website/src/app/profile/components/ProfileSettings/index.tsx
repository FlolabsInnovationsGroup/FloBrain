"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
  });

  const currentPlan = {
    name: "Developer",
    price: "Free",
    period: "",
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.warn("Deleting account...");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Profile Settings</h2>

      <div>
        <label htmlFor="fullName" className="block text-white text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
        />
      </div>

      {/* Current Plan Section (replaces Bio) */}
      <div className="rounded-xl border border-purple-500/30 bg-indigo-950/50 p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Current Plan</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-white font-medium">
              {currentPlan.name}{" "}
              <span className="text-sm text-white/70">
                {currentPlan.price}
                {currentPlan.period && <span>{currentPlan.period}</span>}
              </span>
            </p>
            <p className="text-xs text-white/60 mt-1">
              Manage your subscription and upgrade your plan at any time.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/40 transition-all"
          >
            Change plan
          </Link>
        </div>
      </div>

      <button
        onClick={handleDeleteAccount}
        className="flex items-center gap-2 px-6 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Account
      </button>
    </div>
  );
}
