"use client";

import { memo, useState } from "react";
import { Loader2, Send } from "lucide-react";

export const ContactForm = memo(function ContactForm() {
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
    <div className="rounded-xl border border-white/10 bg-[#0f0818]/92 p-5 shadow-lg sm:p-6 md:p-8">
      <h2 className="mb-4 text-lg font-bold text-white sm:mb-6 sm:text-xl">Get in Touch</h2>
      <p className="mb-5 text-sm text-white/60 sm:mb-6">
        Fill out the form below and we&apos;ll respond within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/90 placeholder-white/40 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/90 placeholder-white/40 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/90 placeholder-white/40 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/90 placeholder-white/40 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3.5 font-semibold text-white shadow-lg transition-colors duration-200 hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:from-purple-600/50 disabled:to-purple-700/50"
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

      <p className="mt-5 text-center text-xs text-white/40 sm:mt-6">
        By submitting this form, you agree to our Privacy Policy and Terms of Service.
      </p>
    </div>
  );
});
