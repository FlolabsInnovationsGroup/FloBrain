"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, User, Shield, Bell, HelpCircle, LogOut } from "lucide-react";
import ProfileSettings from "./components/ProfileSettings";
import AccountSecuritySettings from "./components/AccountSecuritySettings";
import NotificationsSettings from "./components/NotificationsSettings";
import HelpSettings from "./components/HelpSettings";
import BillingSettings from "./components/BillingSettings";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "account" | "notifications" | "billing" | "help";

const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="h-5 w-5 shrink-0" /> },
  { id: "account", label: "Account & Security", icon: <Shield className="h-5 w-5 shrink-0" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5 shrink-0" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="h-5 w-5 shrink-0" /> },
  { id: "help", label: "Help", icon: <HelpCircle className="h-5 w-5 shrink-0" /> },
];

const tabTitles: Record<SettingsTab, string> = {
  profile: "Profile",
  account: "Account & Security",
  notifications: "Notifications",
  billing: "Billing",
  help: "Help",
};

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isAuthenticated", "true");
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navButtonClass = (id: SettingsTab) =>
    cn(
      "fb-profile-nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
      activeTab === id && "fb-profile-nav-item--active"
    );

  const renderNavButtons = (className?: string) => (
    <nav className={cn("space-y-1", className)}>
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setActiveTab(item.id)}
          className={navButtonClass(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <main className="min-h-screen fb-page px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl fb-heading dark:text-white">
            SETTINGS
          </h1>
          <p className="text-sm sm:text-base fb-text-muted">
            Manage your account, security, billing, and preferences
          </p>
        </header>

        {/* Mobile tab strip */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "fb-profile-nav-item--active"
                  : "fb-profile-nav-item border border-transparent"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Sidebar — desktop */}
          <aside className="fb-profile-shell hidden w-full shrink-0 flex-col rounded-2xl p-4 lg:flex lg:w-72">
            {renderNavButtons("flex-1")}
            <div className="fb-profile-divider mt-4 border-t pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="fb-profile-btn-secondary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </aside>

          {/* Main panel */}
          <section className="fb-profile-shell min-w-0 flex-1 rounded-2xl p-6 sm:p-8">
            <h2 className="fb-profile-title mb-6 text-xl font-semibold">
              {tabTitles[activeTab]}
            </h2>

            <div className="min-h-[320px]">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "account" && <AccountSecuritySettings />}
              {activeTab === "notifications" && <NotificationsSettings />}
              {activeTab === "billing" && <BillingSettings />}
              {activeTab === "help" && <HelpSettings />}
            </div>

            {/* Mobile logout */}
            <div className="fb-profile-divider mt-8 border-t pt-6 lg:hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="fb-profile-btn-secondary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
