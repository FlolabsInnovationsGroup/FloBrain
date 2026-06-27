"use client";

import { useState } from "react";
import { settingsCardClass, settingsInputClass } from "../settings-styles";

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
    <div className="space-y-4">
      {settings.map((setting) => (
        <div key={setting.id} className={`flex items-center justify-between ${settingsCardClass}`}>
          <span className="font-medium text-white">{setting.label}</span>
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value as NotificationOption)}
            className={`cursor-pointer px-4 py-2 ${settingsInputClass}`}
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
