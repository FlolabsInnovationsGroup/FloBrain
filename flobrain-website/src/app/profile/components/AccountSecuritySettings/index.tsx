"use client";

import { useState } from "react";

export default function AccountSecuritySettings() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Account & Security</h2>

      <div>
        <label htmlFor="currentPassword" className="block text-white text-sm font-medium mb-2">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          name="current"
          value={passwords.current}
          onChange={handlePasswordChange}
          placeholder="Enter current password"
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-white text-sm font-medium mb-2">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          name="new"
          value={passwords.new}
          onChange={handlePasswordChange}
          placeholder="Enter new password"
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirm"
          value={passwords.confirm}
          onChange={handlePasswordChange}
          placeholder="Confirm new password"
          className="w-full px-4 py-3 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
        />
      </div>

      <div className="border-t border-purple-500/30 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Two-Factor Authentication (2FA)</h3>
            <p className="text-white/60 text-sm mt-1">Add an extra layer of security to your account</p>
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
