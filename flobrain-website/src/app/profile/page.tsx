"use client";

import { useState, useEffect } from "react";
import { CreditCard, Menu, PanelLeftClose, X } from "lucide-react";
import ProfileSettings from "./components/ProfileSettings";
import AccountSecuritySettings from "./components/AccountSecuritySettings";
import NotificationsSettings from "./components/NotificationsSettings";
import HelpSettings from "./components/HelpSettings";
import BillingSettings from "./components/BillingSettings";

const MOBILE_BREAKPOINT = 768;

type SettingsTab = "profile" | "account" | "notifications" | "billing" | "help";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isOpen, setIsOpen] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-hide menu when viewport shrinks to mobile; auto-show when expanding to desktop
  useEffect(() => {
    let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(wasMobile);

    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile && !wasMobile) {
        setIsMenuVisible(false); // narrowed to mobile → hide
      } else if (!mobile && wasMobile) {
        setIsMenuVisible(true); // expanded to desktop → show
      }
      wasMobile = mobile;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back or close the modal
    window.history.back();
  };

  const handleLogout = () => {
    // Implement logout logic
    console.warn("Logging out...");
  };

  const renderNav = () => (
    <nav className="space-y-2">
      <button
        onClick={() => {
          setActiveTab("profile");
          if (isMobile) setIsMenuVisible(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          activeTab === "profile"
            ? "bg-purple-700/50 text-white"
            : "text-white/70 hover:text-white hover:bg-purple-800/30"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Profile
      </button>

      <button
        onClick={() => {
          setActiveTab("account");
          if (isMobile) setIsMenuVisible(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          activeTab === "account"
            ? "bg-purple-700/50 text-white"
            : "text-white/70 hover:text-white hover:bg-purple-800/30"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Account & Security
      </button>

      <button
        onClick={() => {
          setActiveTab("notifications");
          if (isMobile) setIsMenuVisible(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          activeTab === "notifications"
            ? "bg-purple-700/50 text-white"
            : "text-white/70 hover:text-white hover:bg-purple-800/30"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        Notifications
      </button>

      <button
        onClick={() => {
          setActiveTab("billing");
          if (isMobile) setIsMenuVisible(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          activeTab === "billing"
            ? "bg-purple-700/50 text-white"
            : "text-white/70 hover:text-white hover:bg-purple-800/30"
        }`}
      >
        <CreditCard className="w-5 h-5" />
        Billing
      </button>

      <button
        onClick={() => {
          setActiveTab("help");
          if (isMobile) setIsMenuVisible(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          activeTab === "help"
            ? "bg-purple-700/50 text-white"
            : "text-white/70 hover:text-white hover:bg-purple-800/30"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Help
      </button>
    </nav>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 sm:px-6">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-purple-900/95 to-indigo-950/95 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Menu toggle: hide when visible, open when hidden */}
        <button
          type="button"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
          className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors inline-flex items-center justify-center rounded-full p-1.5 bg-purple-900/60 border border-purple-500/40"
          aria-label={isMenuVisible ? "Hide menu" : "Show menu"}
        >
          {isMenuVisible ? (
            <PanelLeftClose size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

          <div className="flex flex-1 min-h-[500px]">
          {/* Sidebar (desktop) */}
          <div
            className={`hidden ${isMenuVisible ? "md:flex" : ""} w-66 bg-purple-900/50 backdrop-blur-md p-6 flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>
              {renderNav()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>

          {/* Content Area - extra left padding to clear menu icon */}
          <div className="flex-1 pt-6 pr-6 sm:pr-8 pb-6 sm:pb-8 pl-14 sm:pl-16 overflow-y-auto">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "account" && <AccountSecuritySettings />}
            {activeTab === "notifications" && <NotificationsSettings />}
              {activeTab === "billing" && <BillingSettings />}
            {activeTab === "help" && <HelpSettings />}
          </div>
        </div>

        {/* Mobile nav overlay */}
        {isMenuVisible && (
          <div className="absolute inset-0 z-20 bg-gradient-to-br from-purple-950/95 to-indigo-950/95 md:hidden">
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  type="button"
                  onClick={() => setIsMenuVisible(false)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Close settings menu"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderNav()}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuVisible(false);
                }}
                className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
