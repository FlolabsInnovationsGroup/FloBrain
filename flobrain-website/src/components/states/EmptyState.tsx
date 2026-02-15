"use client";

import { LucideIcon, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-white/5 p-6 mb-6">
        <Icon className="w-12 h-12 text-white/40" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 max-w-md mb-6">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
};
