"use client";

import SettingsDialog from "./components/SettingsDialog";

const tabTitles: Record<SettingsTab, string> = {
  profile: "Profile",
  account: "Account & Security",
  notifications: "Notifications",
  billing: "Billing",
  help: "Help",
};

export default function SettingsPage() {
  const handleClose = () => {
    window.history.back();
  };

  return <SettingsDialog open onClose={handleClose} />;
}
