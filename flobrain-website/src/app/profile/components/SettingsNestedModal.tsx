"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { settingsNestedOverlay, settingsNestedPanel } from "./settings-styles";

type SettingsNestedModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
};

export function SettingsNestedModal({
  open,
  onClose,
  title,
  titleId,
  children,
}: SettingsNestedModalProps) {
  if (!open) return null;

  return (
    <div
      className={settingsNestedOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={settingsNestedPanel}>
        <div className="mb-6 flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
