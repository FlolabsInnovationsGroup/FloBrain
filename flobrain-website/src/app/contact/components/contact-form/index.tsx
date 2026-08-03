"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFormData({ fullName: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fb-contact-form-card backdrop-blur-md rounded-xl p-8 shadow-lg border">
      <h2 className="text-xl font-bold text-[#2D1B4E] mb-6 dark:text-white">Get in Touch</h2>
      <p className="text-[#5C4A72] text-sm mb-6 dark:text-white/80">
        Fill out the form below and we&apos;ll respond within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="fb-contact-input w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Work Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="fb-contact-input w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <input
            type="text"
            name="company"
            placeholder="Company Type"
            value={formData.company}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="fb-contact-input w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <textarea
            name="message"
            placeholder="Message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="fb-contact-input w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-600/50 disabled:to-purple-700/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg border border-purple-400/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send size={20} />
            </>
          )}
        </button>
      </form>

      <p className="text-[#7A6890] text-xs mt-6 text-center dark:text-white/40">
        By submitting this form, you agree to our Privacy Policy and Terms of Service.
      </p>
    </div>
  );
};
