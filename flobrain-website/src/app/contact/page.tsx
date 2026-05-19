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
    <div className="min-h-screen relative fb-page">
      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D1B4E] mb-4 leading-tight">
            Scale Your AI Intelligence
          </h1>
          <p className="text-base md:text-lg text-[#5C4A72] max-w-2xl leading-relaxed">
            Connect with our engineering team to integrate FloLabs Brain into your workflow, or
            reach out to sales for enterprise solutions and partnerships.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left Column - Contact Form */}
            <div className="space-y-8">
              <div className="bg-white/60 backdrop-blur-md border border-[#9B8AB8]/40 rounded-xl p-8 shadow-lg">
                <h2 className="text-xl font-bold text-[#2D1B4E] mb-6">Get in Touch</h2>
                <p className="text-[#5C4A72] text-sm mb-6">
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
                      className="w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/80 border border-[#9B8AB8]/40 rounded-xl px-4 py-3 text-[#2D1B4E] placeholder-[#7A6890] focus:outline-none focus:border-white/20 focus:bg-white/[0.07] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-[#7A6890] text-xs mt-6 text-center">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <div>
                <h3 className="text-xl font-bold text-[#2D1B4E] mb-6 uppercase tracking-wider">
                  Direct Contact
                </h3>
                <div className="space-y-4">
                  {/* Technical Support */}
                  <div className="relative bg-white/50 backdrop-blur-md border border-[#9B8AB8]/40 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Mail className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D1B4E] mb-2">Technical Support</h4>
                        <p className="text-[#5C4A72] text-sm mb-3">
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
                  <div className="relative bg-white/50 backdrop-blur-md border border-[#9B8AB8]/40 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Users className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D1B4E] mb-2">Partnerships</h4>
                        <p className="text-[#5C4A72] text-sm mb-3">For device manufacturers</p>
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
                  <div className="relative bg-white/50 backdrop-blur-md border border-[#9B8AB8]/40 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Newspaper className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D1B4E] mb-2">Press / Media</h4>
                        <p className="text-[#5C4A72] text-sm mb-3">Media inquiries and press kit</p>
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
              <div className="bg-white/50 backdrop-blur-md border border-[#9B8AB8]/40 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-[#2D1B4E] mb-6 uppercase tracking-wider">
                  Developer Resources
                </h3>

                <div className="space-y-3">
                  {/* API Documentation */}
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <FileText className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2D1B4E] text-sm">API Documentation</h4>
                        <p className="text-[#5C4A72] text-xs">Complete integration guides</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors"
                      size={16}
                    />
                  </div>

                  {/* System Status */}
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <Activity className="text-green-400" size={18} />
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[#2D1B4E] text-sm">System Status</h4>
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                          99.9% Uptime
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors"
                      size={16}
                    />
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Github className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2D1B4E] text-sm">GitHub</h4>
                        <p className="text-[#5C4A72] text-xs">Open source SDKs</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors"
                      size={16}
                    />
                  </div>

                  {/* Discord Community */}
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <MessageCircle className="text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2D1B4E] text-sm">Discord Community</h4>
                        <p className="text-[#5C4A72] text-xs">Join 5,000+ developers</p>
                      </div>
                    </div>
                    <ExternalLink
                      className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors"
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
