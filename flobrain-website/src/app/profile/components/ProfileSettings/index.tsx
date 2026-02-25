"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-[#281C30] border border-zinc-500/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400/70";

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
  });

  const currentPlan = {
    name: "Developer",
    price: "Free",
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
          placeholder="John Doe"
          className={inputClass}
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
          placeholder="john.doe@example.com"
          className={inputClass}
        />
      </div>

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
        onClick={handleDeleteAccount}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#E07A5F] hover:bg-[#d96b4f] text-white font-medium rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
        Delete Account
      </button>
    </div>
  );
}
