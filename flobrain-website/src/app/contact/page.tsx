"use client";

import React, { useState } from "react";
import {
  Brain,
  Send,
  Mail,
  Users,
  Newspaper,
  ExternalLink,
  Github,
  MessageCircle,
  Activity,
  FileText,
  Menu,
  X,
  Loader2,
} from "lucide-react";

export default function Contact() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 relative">
      {/* Soft glowing vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-purple-900/20" />

      {/* Navigation */}
      <nav className="relative z-10 w-full border-b border-white/10 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-400" size={32} />
              <span className="text-purple-400 font-bold text-xl tracking-tight">FLOBRAIN</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </a>
              <a href="#" className="text-purple-400 font-medium text-sm">
                Contact
              </a>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Sign in
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Register
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/80 hover:text-white p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/80 backdrop-blur-md border-t border-white/10">
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#"
                  className="block text-white/80 hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#"
                  className="block text-white/80 hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-purple-400 font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </button>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Scale Your AI Intelligence
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
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
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6">Get in Touch</h2>
                <p className="text-white/60 text-sm mb-6">
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
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-white/40 text-xs mt-6 text-center">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
                  Direct Contact
                </h3>
                <div className="space-y-4">
                  {/* Technical Support */}
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Mail className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Technical Support</h4>
                        <p className="text-white/70 text-sm mb-3">
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
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Users className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Partnerships</h4>
                        <p className="text-white/70 text-sm mb-3">For device manufacturers</p>
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
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl group hover:bg-white/10 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Newspaper className="text-purple-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Press / Media</h4>
                        <p className="text-white/70 text-sm mb-3">Media inquiries and press kit</p>
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
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
                  Developer Resources
                </h3>

                <div className="space-y-3">
                  {/* API Documentation */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
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
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500/20 p-2 rounded-lg">
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
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
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
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">&copy; 2026 FloLabs Brain. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Privacy
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Terms
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
