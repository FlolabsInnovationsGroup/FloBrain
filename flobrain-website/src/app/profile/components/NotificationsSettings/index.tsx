"use client";

import { useState } from "react";

type NotificationOption = "push" | "email" | "off";

interface NotificationSetting {
  id: string;
  label: string;
  value: NotificationOption;
}

export default function NotificationsSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: "alerts", label: "Alerts", value: "push" },
    { id: "setting2", label: "Setting 2", value: "off" },
    { id: "setting3", label: "Setting 3", value: "push" },
  ]);

  const handleSettingChange = (id: string, value: NotificationOption) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  return (
    <div className="space-y-3">
      {settings.map((setting) => (
        <div
          key={setting.id}
          className="fb-profile-card flex items-center justify-between rounded-xl px-4 py-4"
        >
          <span className="fb-profile-title text-sm font-medium">{setting.label}</span>
          <select
            value={setting.value}
            onChange={(e) =>
              handleSettingChange(setting.id, e.target.value as NotificationOption)
            }
            className="fb-profile-field cursor-pointer rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea]/40"
          >
            <option value="push">Push</option>
            <option value="email">Email</option>
            <option value="off">Off</option>
          </select>
        </div>
      ))}
    </div>
  );
}
