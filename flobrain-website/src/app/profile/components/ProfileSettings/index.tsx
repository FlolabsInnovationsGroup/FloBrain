"use client";

import { useState } from "react";

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account...");
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

      <div>
        <label htmlFor="bio" className="block text-white text-sm font-medium mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us a little about yourself..."
          rows={4}
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 resize-none"
        />
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
