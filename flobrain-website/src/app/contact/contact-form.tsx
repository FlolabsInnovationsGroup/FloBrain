"use client";

import { memo, useState } from "react";
import { Loader2, Send } from "lucide-react";

const inputClassName =
  "fb-contact-input w-full rounded-xl border px-4 py-3 transition-colors focus:border-[var(--fb-brain-btn)]/50 focus:ring-2 focus:ring-[var(--fb-brain-btn)]/30 disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="fb-contact-form-card rounded-xl border p-5 sm:p-6 md:p-8">
      <h2 className="fb-contact-heading mb-4 text-lg font-bold sm:mb-6 sm:text-xl">Get in Touch</h2>
      <p className="fb-contact-text-muted mb-5 text-sm sm:mb-6">
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
            className={inputClassName}
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
            className={inputClassName}
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
            className={inputClassName}
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
            className={`${inputClassName} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="fb-contact-btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-lg transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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

      <p className="fb-contact-text-subtle mt-5 text-center text-xs sm:mt-6">
        By submitting this form, you agree to our Privacy Policy and Terms of Service.
      </p>
    </div>
  );
});
