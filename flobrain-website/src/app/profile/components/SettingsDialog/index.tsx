"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Menu,
  PanelLeftClose,
  X,
  User,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import ProfileSettings from "../ProfileSettings";
import AccountSecuritySettings from "../AccountSecuritySettings";
import NotificationsSettings from "../NotificationsSettings";
import HelpSettings from "../HelpSettings";
import BillingSettings from "../BillingSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/layout/dialog";
import { cn } from "@/lib/utils";
import { settingsBtnDestructiveOutline } from "../settings-styles";

const MOBILE_BREAKPOINT = 768;

type SettingsTab = "profile" | "account" | "notifications" | "billing" | "help";

const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { id: "account", label: "Account & Security", icon: <Shield className="h-5 w-5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
  { id: "help", label: "Help", icon: <HelpCircle className="h-5 w-5" /> },
];

const tabTitles: Record<SettingsTab, string> = {
  profile: "Profile Settings",
  account: "Account & Security",
  notifications: "Notifications",
  billing: "Billing",
  help: "Help",
};

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "border-[#AD46FF]/30 bg-[#000000]/80 text-white shadow-[0_0_32px_rgba(126,34,206,0.4)]"
          : "border-transparent text-[#CAD5E2] hover:border-white/5 hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

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

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  const selectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (isMobile) setIsMenuVisible(false);
  };

  const renderNav = () => (
    <nav className="flex flex-col gap-0.5" aria-label="Settings sections">
      {navItems.map((item) => (
        <NavButton
          key={item.id}
          active={activeTab === item.id}
          onClick={() => selectTab(item.id)}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </nav>
  );

  const logoutButton = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-3 px-4 py-3 font-medium",
        settingsBtnDestructiveOutline
      )}
    >
      <LogOut className="h-5 w-5" />
      Logout
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[120] bg-black/60"
        className={cn(
          "z-[120] flex h-[85vh] w-[min(calc(100%-2rem),900px)] max-h-[85vh] max-w-[900px] flex-col gap-0 overflow-hidden rounded-2xl border border-violet-400/30 bg-[#120724] p-0 shadow-2xl outline-none sm:max-w-[900px]"
        )}
        aria-label="Settings"
      >
        <div className="relative flex min-h-0 flex-1">
          <aside
            className={cn(
              "min-w-[220px] flex-col border-r border-white/10 bg-[#0B0719]/90 md:flex md:w-1/3",
              isMenuVisible ? "flex" : "hidden"
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col p-6">
              <h2 className="mb-1 text-lg font-semibold text-white">Settings</h2>
              <p className="mb-4 text-xs text-white/60">Manage your account and preferences.</p>
              <div className="mb-4 h-px bg-white/10" />
              <p className="mb-3 px-1 text-[12px] font-bold uppercase tracking-[0.2em] text-[#90A1B9]">
                Sections
              </p>
              <div className="min-h-0 flex-1 overflow-y-auto">{renderNav()}</div>
              <div className="mt-4 border-t border-white/10 pt-4">
                {logoutButton(handleLogout)}
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col bg-[#0B0719]/55">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">{tabTitles[activeTab]}</h2>
              <button
                type="button"
                onClick={onClose}
                className="-m-1 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
          className="absolute left-5 top-5 z-30 inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white/80 hover:text-white md:hidden"
          aria-label={isMenuVisible ? "Hide menu" : "Show menu"}
        >
          {isMenuVisible ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </button>

        {isMenuVisible && isMobile && (
          <div className="absolute inset-0 z-20 flex flex-col bg-[#0B0719] md:hidden">
            <div className="flex h-full flex-col p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Settings</h2>
                <button
                  type="button"
                  onClick={() => setIsMenuVisible(false)}
                  className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close settings menu"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="mb-4 h-px bg-white/10" />
              <p className="mb-3 px-1 text-[12px] font-bold uppercase tracking-[0.2em] text-[#90A1B9]">
                Sections
              </p>
              <div className="flex-1 overflow-y-auto">{renderNav()}</div>
              <div className="mt-4 border-t border-white/10 pt-4">
                {logoutButton(() => {
                  void handleLogout();
                  setIsMenuVisible(false);
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
