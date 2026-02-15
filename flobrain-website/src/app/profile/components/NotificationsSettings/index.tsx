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
    setSettings(settings.map(s => (s.id === id ? { ...s, value } : s)));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Notifications</h2>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 bg-indigo-950/30 border border-purple-500/20 rounded-lg"
          >
            <span className="text-white font-medium">{setting.label}</span>
            <select
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value as NotificationOption)}
              className="px-4 py-2 bg-indigo-950/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/60 cursor-pointer"
            >
              <option value="push">Push</option>
              <option value="email">Email</option>
              <option value="off">Off</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
