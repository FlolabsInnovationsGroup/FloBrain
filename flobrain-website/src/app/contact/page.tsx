"use client";

import React, { useState } from "react";
import {
  Send,
  Mail,
  Users,
  Newspaper,
  ExternalLink,
  Github,
  MessageCircle,
  Activity,
  FileText,
  Loader2,
} from "lucide-react";

export default function Contact() {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Handle success (could show toast/notification)
      setFormData({ fullName: "", email: "", company: "", message: "" });
    } catch (error) {
      // Handle error
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
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="mb-4 text-[22px] font-bold leading-tight text-white sm:text-[28px] md:text-[32px] lg:text-[36px]">
            Scale Your AI Intelligence
          </h1>
          <p className="max-w-[90%] text-sm leading-relaxed text-white/70 sm:max-w-[80%] sm:text-base md:max-w-[70%] md:text-lg lg:max-w-[60%] lg:text-xl">
            Connect with our engineering team to integrate FloLabs Brain into your workflow, or
            reach out to sales for enterprise solutions and partnerships.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 pb-16 sm:pb-20 md:pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Left Column - Contact Form */}
            <div className="space-y-6 sm:space-y-8">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md sm:p-6 md:p-8">
                <h2 className="mb-4 text-lg font-bold text-white sm:mb-6 sm:text-xl">
                  Get in Touch
                </h2>
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:from-purple-600/50 disabled:to-purple-700/50"
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
            </div>

            {/* Right Column */}
            <div className="space-y-6 sm:space-y-8">
              {/* Direct Contact */}
              <div>
                <h3 className="mb-5 text-lg font-bold uppercase tracking-wider text-white sm:mb-6 sm:text-xl">
                  Direct Contact
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Technical Support */}
                  <div className="group relative rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/10 sm:p-6">
                    <div className="absolute right-4 top-4 text-white/30 transition-colors group-hover:text-white/50">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Mail className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-semibold text-white">Technical Support</h4>
                        <p className="mb-3 text-sm text-white/70">
                          For developers integrating the SDK
                        </p>
                        <a
                          href="mailto:support@flolabs.ai"
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          support@flolabs.ai
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Partnerships */}
                  <div className="group relative rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/10 sm:p-6">
                    <div className="absolute right-4 top-4 text-white/30 transition-colors group-hover:text-white/50">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Users className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-semibold text-white">Partnerships</h4>
                        <p className="mb-3 text-sm text-white/70">For device manufacturers</p>
                        <a
                          href="mailto:partners@flolabs.ai"
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          partners@flolabs.ai
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Press / Media */}
                  <div className="group relative rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/10 sm:p-6">
                    <div className="absolute right-4 top-4 text-white/30 transition-colors group-hover:text-white/50">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Newspaper className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-semibold text-white">Press / Media</h4>
                        <p className="mb-3 text-sm text-white/70">Media inquiries and press kit</p>
                        <a
                          href="mailto:press@flolabs.ai"
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          press@flolabs.ai
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Resources */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:p-6 md:p-8">
                <h3 className="mb-5 text-xl font-bold uppercase tracking-wider text-white sm:mb-6 sm:text-2xl">
                  Developer Resources
                </h3>

                <div className="space-y-3">
                  {/* API Documentation */}
                  <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <FileText className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">API Documentation</h4>
                        <p className="text-white/60 text-xs">Complete integration guides</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-white/40 group-hover:text-white/60 transition-colors"
                      size={16}
                    />
                  </div>

                  {/* System Status */}
                  <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="rounded-lg bg-green-500/20 p-2">
                        <Activity className="text-green-400" size={18} />
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-sm">System Status</h4>
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                          99.9% Uptime
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-white/40 group-hover:text-white/60 transition-colors"
                      size={16}
                    />
                  </div>

                  {/* GitHub */}
                  <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Github className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">GitHub</h4>
                        <p className="text-white/60 text-xs">Open source SDKs</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-white/40 group-hover:text-white/60 transition-colors"
                      size={16}
                    />
                  </div>

                  {/* Discord Community */}
                  <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <MessageCircle className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Discord Community</h4>
                        <p className="text-white/60 text-xs">Join 5,000+ developers</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-white/40 group-hover:text-white/60 transition-colors"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
