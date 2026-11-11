"use client";

import SettingsDialog from "./components/SettingsDialog";

export default function SettingsPage() {
  const handleClose = () => {
    window.history.back();
  };

  return <SettingsDialog open onClose={handleClose} />;
}
