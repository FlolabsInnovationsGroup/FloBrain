"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Menu, PanelLeftClose, X, User, Shield, Bell, HelpCircle, LogOut } from "lucide-react";
import ProfileSettings from "../ProfileSettings";
import AccountSecuritySettings from "../AccountSecuritySettings";
import NotificationsSettings from "../NotificationsSettings";
import HelpSettings from "../HelpSettings";
import BillingSettings from "../BillingSettings";
import { useAuth } from "@/contexts/AuthContext";

const MOBILE_BREAKPOINT = 768;

type SettingsTab = "profile" | "account" | "notifications" | "billing" | "help";

const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  { id: "account", label: "Account & Security", icon: <Shield className="w-5 h-5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
  { id: "help", label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
];

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;

    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile && !wasMobile) {
        setIsMenuVisible(false);
      } else if (!mobile && wasMobile) {
        setIsMenuVisible(true);
      }
      wasMobile = mobile;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  const renderNav = () => (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            if (isMobile) setIsMenuVisible(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-lg transition-colors text-left ${
            activeTab === item.id
              ? "bg-[#3D2C4D] text-white"
              : "text-white/80 hover:text-white hover:bg-purple-900/40"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-400/30 backdrop-blur-xl p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        className="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: "85%", maxWidth: "900px", height: "90vh" }}
      >
        <div className="flex flex-1 min-h-0 bg-[#2E1E3A]">
          <div
            className={`${isMenuVisible ? "flex" : "hidden"} md:flex md:w-1/3 min-w-[220px] flex-col bg-[#2E1E3A] border-r border-purple-900/30`}
          >
            <div className="p-6 flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
              <div className="h-px bg-white/20 mb-4" />
              <div className="flex-1 overflow-y-auto">{renderNav()}</div>
              <div className="pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#E07A5F] hover:bg-[#d96b4f] text-white font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-[#281C30]">
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {activeTab === "profile" && "Profile Settings"}
                {activeTab === "account" && "Account & Security"}
                {activeTab === "notifications" && "Notifications"}
                {activeTab === "billing" && "Billing"}
                {activeTab === "help" && "Help"}
              </h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1 -m-1"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "account" && <AccountSecuritySettings />}
              {activeTab === "notifications" && <NotificationsSettings />}
              {activeTab === "billing" && <BillingSettings />}
              {activeTab === "help" && <HelpSettings />}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
          className="absolute top-5 left-5 z-30 text-white/80 hover:text-white md:hidden inline-flex items-center justify-center rounded-full p-2 bg-white/10"
          aria-label={isMenuVisible ? "Hide menu" : "Show menu"}
        >
          {isMenuVisible ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </button>

        {isMenuVisible && isMobile && (
          <div className="absolute inset-0 z-20 bg-[#2E1E3A] md:hidden flex flex-col">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
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
              <div className="h-px bg-white/20 mb-4" />
              <div className="flex-1 overflow-y-auto">{renderNav()}</div>
              <div className="pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuVisible(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#E07A5F] hover:bg-[#d96b4f] text-white font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
