"use client";

import { useDroppable } from "@dnd-kit/core";

interface AgentRoleSlotProps {
  role: "control" | "general" | "notion" | "judge";
  label: string;
  description: string;
  icon: string;
  currentModel: { provider: string; model: string; custom: boolean } | null;
  onModelSelect: (role: string, provider: string, model: string) => void;
}

const providerBadgeClass: Record<string, string> = {
  openai: "bg-green-900/50 text-green-300",
  anthropic: "bg-orange-900/50 text-orange-300",
  ollama: "bg-blue-900/50 text-blue-300",
};

export function AgentRoleSlot({ role, label, icon, description, currentModel }: AgentRoleSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id: role });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 rounded-xl border p-4 transition-all
        ${isOver
          ? "border-[#7c3aed] bg-[#2a1a4a] shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          : "border-[#3d1f6e]/50 bg-[#150025]"
        }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="text-xs text-zinc-500">{description}</p>

      {currentModel ? (
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${providerBadgeClass[currentModel.provider] ?? "bg-white/10 text-zinc-300"}`}>
            {currentModel.provider}
          </span>
          <span className="truncate text-xs text-zinc-200">{currentModel.model}</span>
        </div>
      ) : (
        <div className={`mt-auto rounded-lg border-2 border-dashed px-3 py-2 text-center text-xs transition-colors
          ${isOver ? "border-[#7c3aed] text-[#a855f7]" : "border-white/10 text-zinc-600"}`}>
          Drop a model here
        </div>
      )}
    </div>
  );
}
