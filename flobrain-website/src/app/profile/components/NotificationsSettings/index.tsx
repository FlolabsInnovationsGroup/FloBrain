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
    <div className="space-y-4">
      {settings.map((setting) => (
        <div
          key={setting.id}
          className="flex items-center justify-between p-4 bg-[#281C30] border border-zinc-500/50 rounded-lg"
        >
          <span className="text-white font-medium">{setting.label}</span>
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value as NotificationOption)}
            className="px-4 py-2 bg-[#281C30] border border-zinc-500/50 rounded-lg text-white focus:outline-none focus:border-zinc-400/70 cursor-pointer"
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
